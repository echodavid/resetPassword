const PasswordResetService = require('../services/PasswordResetService');
const Database = require('better-sqlite3');

describe('PasswordResetService', () => {
  let db;
  let service;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, locked INTEGER DEFAULT 0, session_version INTEGER DEFAULT 0)`);
    service = new PasswordResetService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('validatePassword should return true for valid password', () => {
    expect(service.validatePassword('ValidPass123456!')).toBe(true);
  });

  test('validatePassword should return false for invalid password', () => {
    expect(service.validatePassword('short')).toBe(false);
  });

  test('userExists should check DB', () => {
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('test@example.com', 'hash');
    expect(service.userExists('test@example.com')).toBe(true);
    expect(service.userExists('nonexistent@example.com')).toBe(false);
  });

  test('registerUser should hash and insert', async () => {
    await service.registerUser('test@example.com', 'password');
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get('test@example.com');
    expect(row.email).toBe('test@example.com');
    expect(row.password).not.toBe('password'); // should be hashed
  });

  test('authenticateUser should compare password', async () => {
    await service.registerUser('test@example.com', 'password');
    const user = await service.authenticateUser('test@example.com', 'password');
    expect(user.email).toBe('test@example.com');
    const invalid = await service.authenticateUser('test@example.com', 'wrong');
    expect(invalid).toBeNull();
  });

  test('authenticateUser should handle bcrypt error', async () => {
    // Insert invalid hash to simulate error
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('test@example.com', 'invalidhash');
    const user = await service.authenticateUser('test@example.com', 'password');
    expect(user).toBeNull();
  });

  test('unlockUser should set locked to 0', async () => {
    db.prepare('INSERT INTO users (email, password, locked) VALUES (?, ?, ?)').run('locked@example.com', 'hash', 1);
    await service.unlockUser('locked@example.com');
    const row = db.prepare('SELECT locked FROM users WHERE email = ?').get('locked@example.com');
    expect(row.locked).toBe(0);
  });

  test('invalidateSessions should increment session_version', async () => {
    db.prepare('INSERT INTO users (email, password, session_version) VALUES (?, ?, ?)').run('session@example.com', 'hash', 1);
    await service.invalidateSessions('session@example.com');
    const row = db.prepare('SELECT session_version FROM users WHERE email = ?').get('session@example.com');
    expect(row.session_version).toBe(2);
  });
});
