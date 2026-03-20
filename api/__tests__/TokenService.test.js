const TokenService = require('../services/TokenService');
const Database = require('better-sqlite3');

describe('TokenService', () => {
  let db;
  let service;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`CREATE TABLE reset_tokens (token_hash TEXT PRIMARY KEY, email TEXT, expires INTEGER)`);
    service = new TokenService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('generateToken should return a string', () => {
    const token = service.generateToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });

  test('hashToken should return sha256 hash', () => {
    const hash = service.hashToken('test');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('storeToken should insert into DB', () => {
    service.storeToken('hash', 'email');
    const row = db.prepare('SELECT * FROM reset_tokens WHERE token_hash = ?').get('hash');
    expect(row).toEqual({
      token_hash: 'hash',
      email: 'email',
      expires: expect.any(Number)
    });
  });

  test('validateToken should query DB', () => {
    service.storeToken('hash', 'email');
    const result = service.validateToken('hash');
    expect(result).toEqual({
      token_hash: 'hash',
      email: 'email',
      expires: expect.any(Number)
    });
  });

  test('removeToken should delete from DB', () => {
    service.storeToken('hash', 'email');
    service.removeToken('hash');
    const row = db.prepare('SELECT * FROM reset_tokens WHERE token_hash = ?').get('hash');
    expect(row).toBeUndefined();
  });
});
