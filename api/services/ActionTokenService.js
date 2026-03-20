const crypto = require('crypto');
const { ACTION_TOKEN_EXPIRATION } = require('../config');

class ActionTokenService {
  constructor(db) {
    this.db = db;
    this.insertToken = this.db.prepare(
      `INSERT INTO action_tokens (token_hash, email, purpose, expires, used, created) VALUES (?, ?, ?, ?, 0, ?)`
    );
    this.getToken = this.db.prepare(`SELECT * FROM action_tokens WHERE token_hash = ? AND expires > ? AND used = 0`);
    this.markUsed = this.db.prepare(`UPDATE action_tokens SET used = 1 WHERE token_hash = ?`);
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  storeToken(tokenHash, email, purpose) {
    this.insertToken.run(tokenHash, email, purpose, Date.now() + ACTION_TOKEN_EXPIRATION, Date.now());
  }

  validateToken(tokenHash) {
    return this.getToken.get(tokenHash, Date.now());
  }

  consumeToken(tokenHash) {
    this.markUsed.run(tokenHash);
  }
}

module.exports = ActionTokenService;
