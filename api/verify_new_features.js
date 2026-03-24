const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const ActionTokenService = require('./services/ActionTokenService');
const VerificationService = require('./services/VerificationService');
const PasswordResetService = require('./services/PasswordResetService');

async function test() {
  const db = new Database('password_reset.db');
  const actionTokenService = new ActionTokenService(db);
  const verificationService = new VerificationService(db);
  const passwordService = new PasswordResetService(db);

  const email = 'user@example.com';

  console.log('--- Testing Recovery Flow ---');
  const code = verificationService.generateCode();
  const codeHash = verificationService.hashCode(code);
  verificationService.storeCode(codeHash, email, 'recovery');
  console.log(`Stored recovery code for ${email}`);

  const validation = verificationService.validateCode(email, 'recovery', code);
  console.log(`Validation status: ${validation.status}`);

  if (validation.status === 'ok') {
    const actionToken = actionTokenService.generateToken();
    const tokenHash = actionTokenService.hashToken(actionToken);
    actionTokenService.storeToken(tokenHash, email, 'recovery');
    console.log(`Generated actionToken for recovery`);

    const tokenRow = actionTokenService.validateToken(tokenHash);
    console.log(`Action token valid: ${!!tokenRow}`);
  }

  console.log('\n--- Testing Unlock Account ---');
  db.prepare('UPDATE users SET locked = 1 WHERE email = ?').run(email);
  const userLocked = db.prepare('SELECT locked FROM users WHERE email = ?').get(email);
  console.log(`User locked before: ${userLocked.locked}`);

  const unlockToken = actionTokenService.generateToken();
  const unlockHash = actionTokenService.hashToken(unlockToken);
  actionTokenService.storeToken(unlockHash, email, 'unlock-account');
  
  const tokenRowUnlock = actionTokenService.validateToken(unlockHash);
  if (tokenRowUnlock && tokenRowUnlock.purpose === 'unlock-account') {
    actionTokenService.consumeToken(unlockHash);
    await passwordService.unlockUser(email);
    const userUnlocked = db.prepare('SELECT locked FROM users WHERE email = ?').get(email);
    console.log(`User locked after: ${userUnlocked.locked}`);
  }

  console.log('\n--- Testing Logout All ---');
  const userSessionsBefore = db.prepare('SELECT session_version FROM users WHERE email = ?').get(email);
  console.log(`Session version before: ${userSessionsBefore.session_version}`);

  const logoutToken = actionTokenService.generateToken();
  const logoutHash = actionTokenService.hashToken(logoutToken);
  actionTokenService.storeToken(logoutHash, email, 'logout-all');

  const tokenRowLogout = actionTokenService.validateToken(logoutHash);
  if (tokenRowLogout && tokenRowLogout.purpose === 'logout-all') {
    actionTokenService.consumeToken(logoutHash);
    await passwordService.invalidateSessions(email);
    const userSessionsAfter = db.prepare('SELECT session_version FROM users WHERE email = ?').get(email);
    console.log(`Session version after: ${userSessionsAfter.session_version}`);
  }

  db.close();
}

test().catch(console.error);
