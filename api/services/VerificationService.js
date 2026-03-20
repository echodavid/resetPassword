const crypto = require('crypto');
const { VERIFICATION_CODE_EXPIRATION, VERIFICATION_MAX_ATTEMPTS } = require('../config');

class VerificationService {
  constructor(db) {
    this.db = db;
    this.insertCode = this.db.prepare(
      `INSERT INTO verification_codes (code_hash, email, purpose, expires, used, attempts, max_attempts, created)
       VALUES (?, ?, ?, ?, 0, 0, ?, ?)`
    );
    this.getActiveCode = this.db.prepare(
      `SELECT * FROM verification_codes WHERE email = ? AND purpose = ? AND expires > ? AND used = 0 ORDER BY created DESC LIMIT 1`
    );
    this.getLatestCode = this.db.prepare(
      `SELECT * FROM verification_codes WHERE email = ? AND purpose = ? ORDER BY created DESC LIMIT 1`
    );
    this.markUsed = this.db.prepare(`UPDATE verification_codes SET used = 1 WHERE code_hash = ?`);
    this.incrementAttempts = this.db.prepare(
      `UPDATE verification_codes SET attempts = attempts + 1, used = CASE WHEN attempts + 1 >= max_attempts THEN 1 ELSE used END WHERE code_hash = ?`
    );
    this.getByHash = this.db.prepare(`SELECT * FROM verification_codes WHERE code_hash = ?`);
  }

  generateCode() {
    // 6-digit numeric code
    return ('' + Math.floor(100000 + Math.random() * 900000));
  }

  hashCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  storeCode(codeHash, email, purpose) {
    this.insertCode.run(
      codeHash,
      email,
      purpose,
      Date.now() + VERIFICATION_CODE_EXPIRATION,
      VERIFICATION_MAX_ATTEMPTS,
      Date.now()
    );
  }

  getCurrentCode(email, purpose) {
    return this.getActiveCode.get(email, purpose, Date.now());
  }

  consumeCode(codeHash) {
    this.markUsed.run(codeHash);
  }

  recordAttempt(codeHash) {
    this.incrementAttempts.run(codeHash);
  }

  validateCode(email, purpose, code) {
    const row = this.getCurrentCode(email, purpose);
    if (!row) {
      const latest = this.getLatestCode.get(email, purpose);
      if (latest && latest.attempts >= latest.max_attempts) return { status: 'too_many_attempts' };
      return { status: 'invalid' };
    }

    const codeHash = this.hashCode(code);
    if (codeHash !== row.code_hash) {
      this.recordAttempt(row.code_hash);
      const updated = this.getByHash.get(row.code_hash);
      if (!updated || updated.used || updated.attempts >= updated.max_attempts) {
        return { status: 'too_many_attempts' };
      }
      return { status: 'invalid' };
    }

    // Good code: consume it and return success
    this.consumeCode(row.code_hash);
    return { status: 'ok' };
  }
}

module.exports = VerificationService;
