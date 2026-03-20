const bcrypt = require('bcrypt');
const { PASSWORD_REGEX } = require('../config');

class PasswordResetService {
  constructor(db) {
    this.db = db;
    this.getUser = this.db.prepare('SELECT * FROM users WHERE email = ?');
    this.insertUser = this.db.prepare('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)');
    this.updatePassword = this.db.prepare('UPDATE users SET password = ? WHERE email = ?');
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  validatePassword(password) {
    return PASSWORD_REGEX.test(password);
  }

  async registerUser(email, password) {
    const hashed = await this.hashPassword(password);
    this.insertUser.run(email, hashed);
  }

  async authenticateUser(email, password) {
    const user = this.getUser.get(email);
    if (user && await this.comparePassword(password, user.password)) {
      return user;
    }
    return null;
  }

  async resetPassword(email, newPassword) {
    const hashed = await this.hashPassword(newPassword);
    this.updatePassword.run(hashed, email);
  }

  userExists(email) {
    return !!this.getUser.get(email);
  }
}

module.exports = PasswordResetService;
