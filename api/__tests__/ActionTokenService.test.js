const ActionTokenService = require('../services/ActionTokenService');
const Database = require('better-sqlite3');

describe('ActionTokenService', () => {
  let db;
  let service;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`CREATE TABLE action_tokens (token_hash TEXT PRIMARY KEY, email TEXT, purpose TEXT, expires INTEGER, used INTEGER, created INTEGER)`);
    service = new ActionTokenService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('generateToken returns 64 char string', () => {
    const token = service.generateToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });

  test('hashToken returns sha256 hash', () => {
    const hash = service.hashToken('test');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('storeToken and validateToken', () => {
    const token = service.generateToken();
    const hash = service.hashToken(token);
    service.storeToken(hash, 'a@b.com', 'change-password');

    const row = service.validateToken(hash);
    expect(row).toBeDefined();
    expect(row.email).toBe('a@b.com');
  });

  test('consumeToken prevents reuse', () => {
    const token = service.generateToken();
    const hash = service.hashToken(token);
    service.storeToken(hash, 'a@b.com', 'change-password');

    service.consumeToken(hash);
    const row = service.validateToken(hash);
    expect(row).toBeUndefined();
  });
});
