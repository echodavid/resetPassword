const Database = require('better-sqlite3');
const VerificationService = require('./services/VerificationService');
const db = new Database(':memory:');
db.exec(`CREATE TABLE verification_codes (code_hash TEXT PRIMARY KEY, email TEXT, purpose TEXT, expires INTEGER, used INTEGER, attempts INTEGER, max_attempts INTEGER, created INTEGER)`);
const service = new VerificationService(db);
const code = service.generateCode();
const hash = service.hashCode(code);
service.storeCode(hash, 'a@b.com', 'change-password');
for (let i = 0; i < 5; i++) {
  const r = service.validateCode('a@b.com', 'change-password', '000000');
  console.log('attempt', i + 1, r);
}
console.log('final row', db.prepare('select * from verification_codes where code_hash=?').get(hash));
