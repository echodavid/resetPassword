const VerificationService = require('../services/VerificationService');
const Database = require('better-sqlite3');

describe('VerificationService', () => {
  let db;
  let service;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(`CREATE TABLE verification_codes (code_hash TEXT PRIMARY KEY, email TEXT, purpose TEXT, expires INTEGER, used INTEGER, attempts INTEGER, max_attempts INTEGER, created INTEGER)`);
    service = new VerificationService(db);
  });

  afterEach(() => {
    db.close();
  });

  test('generateCode returns 6 digits', () => {
    const code = service.generateCode();
    expect(code).toMatch(/^[0-9]{6}$/);
  });

  test('storeCode and validateCode works', () => {
    const code = service.generateCode();
    const hash = service.hashCode(code);
    service.storeCode(hash, 'a@b.com', 'change-password');

    const result = service.validateCode('a@b.com', 'change-password', code);
    expect(result.status).toBe('ok');
  });

  test('validateCode rejects wrong code and increments attempts', () => {
    const code = service.generateCode();
    const hash = service.hashCode(code);
    service.storeCode(hash, 'a@b.com', 'change-password');

    const wrong = service.validateCode('a@b.com', 'change-password', '000000');
    expect(wrong.status).toBe('invalid');

    const row = db.prepare('SELECT * FROM verification_codes WHERE code_hash = ?').get(hash);
    expect(row.attempts).toBe(1);
  });

  test('validateCode blocks after max attempts', () => {
    const code = service.generateCode();
    const hash = service.hashCode(code);
    service.storeCode(hash, 'a@b.com', 'change-password');

    // exhaust attempts
    for (let i = 0; i < 5; i++) {
      service.validateCode('a@b.com', 'change-password', '000000');
    }

    const result = service.validateCode('a@b.com', 'change-password', code);
    expect(result.status).toBe('too_many_attempts');
  });
});
