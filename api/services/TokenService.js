const crypto = require('crypto');
const { TOKEN_EXPIRATION } = require('../config');

class TokenService {
  constructor(db) {
    this.db = db;
    this.insertToken = this.db.prepare('INSERT INTO reset_tokens (token_hash, email, expires) VALUES (?, ?, ?)');
    this.getToken = this.db.prepare('SELECT * FROM reset_tokens WHERE token_hash = ? AND expires > ?');
    this.deleteToken = this.db.prepare('DELETE FROM reset_tokens WHERE token_hash = ?');
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  storeToken(tokenHash, email) {
    this.insertToken.run(tokenHash, email, Date.now() + TOKEN_EXPIRATION);
  }

  validateToken(tokenHash) {
    return this.getToken.get(tokenHash, Date.now());
  }

  removeToken(tokenHash) {
    this.deleteToken.run(tokenHash);
  }
}

module.exports = TokenService;
