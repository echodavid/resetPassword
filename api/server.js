require('dotenv').config();
console.log('Starting server...');
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const app = express();

const RateLimiter = require('./services/RateLimiter');
const AuditService = require('./services/AuditService');
const TokenService = require('./services/TokenService');
const VerificationService = require('./services/VerificationService');
const ActionTokenService = require('./services/ActionTokenService');
const PasswordResetService = require('./services/PasswordResetService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to get client IP
function getIP(req) {
	return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Session management helpers
function getSessionToken(req) {
	const auth = req.headers.authorization || '';
	if (!auth.startsWith('Bearer ')) return null;
	return auth.slice(7).trim();
}

function validateSession(token) {
	if (!token) return null;
	const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires > ?').get(token, Date.now());
	if (!session) return null;
	const user = db.prepare('SELECT * FROM users WHERE email = ?').get(session.email);
	if (!user) return null;
	if (user.session_version !== session.session_version) return null;
	if (user.locked) return null;
	return { email: user.email, session_version: user.session_version };
}

function requireSession(req, res) {
	const token = getSessionToken(req);
	const session = validateSession(token);
	if (!session) {
		res.status(401).json({ error: 'No autorizado. Por favor inicia sesión.' });
		return null;
	}
	return session;
}

function createSession(email) {
	const token = crypto.randomBytes(32).toString('hex');
	const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
	const sessionVersion = user ? user.session_version || 0 : 0;
	const expires = Date.now() + require('./config').SESSION_EXPIRATION;
	db.prepare('INSERT INTO sessions (token, email, session_version, expires) VALUES (?, ?, ?, ?)').run(token, email, sessionVersion, expires);
	return token;
}

function invalidateSession(token) {
	db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function invalidateAllSessions(email) {
	db.prepare('DELETE FROM sessions WHERE email = ?').run(email);
}

function bumpSessionVersion(email) {
	db.prepare('UPDATE users SET session_version = session_version + 1 WHERE email = ?').run(email);
}

// Email transporter (using Gmail SMTP)
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});


// Initialize SQLite DB (persistent file)
const db = new Database('password_reset.db');

// Create tables if not exist
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)`);
// Add optional columns for locking and session version (migration safe)
const userColumns = db.prepare("PRAGMA table_info(users)").all().map(r => r.name);
if (!userColumns.includes('locked')) db.prepare('ALTER TABLE users ADD COLUMN locked INTEGER DEFAULT 0').run();
if (!userColumns.includes('session_version')) db.prepare('ALTER TABLE users ADD COLUMN session_version INTEGER DEFAULT 0').run();

db.exec(`CREATE TABLE IF NOT EXISTS reset_tokens (token_hash TEXT PRIMARY KEY, email TEXT, expires INTEGER)`);
db.exec(`CREATE TABLE IF NOT EXISTS verification_codes (code_hash TEXT PRIMARY KEY, email TEXT, purpose TEXT, expires INTEGER, used INTEGER, attempts INTEGER, max_attempts INTEGER, created INTEGER)`);
db.exec(`CREATE TABLE IF NOT EXISTS action_tokens (token_hash TEXT PRIMARY KEY, email TEXT, purpose TEXT, expires INTEGER, used INTEGER, created INTEGER)`);
db.exec(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, email TEXT, session_version INTEGER, expires INTEGER)`);
db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, email TEXT, ip TEXT, timestamp INTEGER, details TEXT)`);

// Insert demo user if not exists
const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)');
const hashedDemoPass = bcrypt.hashSync('oldpass', 10);
insertUser.run('user@example.com', hashedDemoPass);

// Initialize services
const rateLimiter = new RateLimiter();
const auditService = new AuditService(db);
const tokenService = new TokenService(db);
const verificationService = new VerificationService(db);
const actionTokenService = new ActionTokenService(db);
const passwordService = new PasswordResetService(db);

// Password policy regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
// Basic email validation (not RFC perfect, but sufficient for this demo)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password policy endpoint
app.get('/policy', (req, res) => {
	res.json({
		policy: 'La contraseña debe tener al menos 12 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*?&).'
	});
});

app.get('/', (req, res) => res.redirect('/login'));

app.get('/forgot', (req, res) => res.sendFile(__dirname + '/public/forgot.html'));
// Endpoint: Login
app.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos.' });
	if (!emailRegex.test(email)) return res.status(400).json({ error: 'Formato de correo inválido.' });
	if (rateLimiter.checkRateLimit(getIP(req), 'login')) return res.status(429).json({ error: 'Demasiadas solicitudes.' });
	try {
		const user = await passwordService.authenticateUser(email, password);
		auditService.log('login', email, getIP(req), user ? 'success' : 'fail');
		if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });
		const sessionToken = createSession(email);
		return res.json({ message: 'Inicio de sesión exitoso.', sessionToken });
	} catch (e) {
		console.error('Login error:', e);
		return res.status(500).json({ error: 'Error interno.' });
	}
});

// Endpoint: Register
app.post('/register', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos.' });
	if (!emailRegex.test(email)) return res.status(400).json({ error: 'Formato de correo inválido.' });
	if (!passwordRegex.test(password)) return res.status(400).json({ error: 'La contraseña no cumple con la política.' });
	try {
		if (passwordService.userExists(email)) return res.status(409).json({ error: 'El usuario ya existe.' });
		await passwordService.registerUser(email, password);
		auditService.log('register', email, getIP(req), 'success');
		return res.json({ message: 'Registro exitoso.' });
	} catch (e) {
		return res.status(500).json({ error: 'Error interno.' });
	}
});

// Endpoint: Forgot password (request reset)
app.post('/forgot', async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ error: 'Correo requerido.' });
	if (rateLimiter.checkRateLimit(getIP(req), 'forgot')) return res.status(429).json({ error: 'Demasiadas solicitudes.' });
	try {
		// Always respond generic
		if (passwordService.userExists(email)) {
			const code = verificationService.generateCode();
			const codeHash = verificationService.hashCode(code);
			verificationService.storeCode(codeHash, email, 'recovery');
			
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
			const recoveryLink = `${frontendUrl}/#reset?email=${encodeURIComponent(email)}&code=${code}`;
			console.log(`[RECOVERY LINK SENT to ${email}]: ${recoveryLink}`);
			
			await transporter.sendMail({
				to: email,
				subject: 'Enlace de Recuperación de Contraseña',
				html: `
					<p>Has solicitado la recuperación de tu contraseña.</p>
					<p>Haz clic en el enlace de abajo para restablecerla:</p>
					<p><a href="${recoveryLink}">${recoveryLink}</a></p>
					<p>O utiliza este código de 6 dígitos: <b>${code}</b></p>
					<p>Este código expira en 5 minutos.</p>
				`
			});
			auditService.log('forgot', email, getIP(req), 'link sent');
		} else {
			auditService.log('forgot', email, getIP(req), 'no account');
		}
		return res.json({ message: 'If the account exists, a verification code was sent.' });
	} catch (e) {
		return res.status(500).json({ error: 'Internal error.' });
	}
});

// Endpoint: Verify identity (send code)
app.post('/verify/send', async (req, res) => {
	const { email, purpose } = req.body;
	const allowed = new Set(['change-password', 'update-email', 'logout-all', 'unlock-account', 'recovery']);
	if (!email || !purpose) return res.status(400).json({ error: 'Correo y propósito requeridos.' });
	if (!allowed.has(purpose)) return res.status(400).json({ error: 'Propósito inválido.' });
	if (rateLimiter.checkRateLimit(getIP(req), 'verify-send')) return res.status(429).json({ error: 'Demasiadas solicitudes.' });
	try {
		if (passwordService.userExists(email)) {
			const code = verificationService.generateCode();
			const codeHash = verificationService.hashCode(code);
			verificationService.storeCode(codeHash, email, purpose);
			console.log(`[VERIFICATION CODE SENT to ${email} (purpose: ${purpose})]: ${code}`);
			const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
			await transporter.sendMail({
				to: email,
				subject: 'Código de Verificación',
				html: `Tu código de verificación es <b>${code}</b>. Expira en 5 minutos.`
			});
			auditService.log('verify_send', email, getIP(req), `purpose=${purpose}`);
		} else {
			auditService.log('verify_send', email, getIP(req), `purpose=${purpose} (no account)`);
		}
		return res.json({ message: 'If the account exists, a verification code was sent.' });
	} catch (e) {
		return res.status(500).json({ error: 'Internal error.' });
	}
});

// Endpoint: Verify identity (check code)
app.post('/verify/check', async (req, res) => {
	const { email, purpose, code } = req.body;
	if (!email || !purpose || !code) return res.status(400).json({ error: 'Correo, propósito y código requeridos.' });
	if (rateLimiter.checkRateLimit(getIP(req), 'verify-check')) return res.status(429).json({ error: 'Demasiadas solicitudes.' });
	try {
		const result = verificationService.validateCode(email, purpose, code);
		auditService.log('verify_check', email, getIP(req), `purpose=${purpose} status=${result.status}`);
		if (result.status === 'ok') {
			const actionToken = actionTokenService.generateToken();
			const tokenHash = actionTokenService.hashToken(actionToken);
			actionTokenService.storeToken(tokenHash, email, purpose);
			return res.json({ verified: true, actionToken });
		}
		if (result.status === 'too_many_attempts') return res.status(429).json({ error: 'Demasiados intentos. Inténtalo más tarde.' });
		return res.status(400).json({ error: 'Código inválido.' });
	} catch (e) {
		return res.status(500).json({ error: 'Internal error.' });
	}
});

// Endpoint: Reset password
app.post('/reset', async (req, res) => {
	const { token, password } = req.body;
	if (!token || !password) return res.status(400).json({ error: 'Token and password required.' });
	if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Password does not meet policy.' });
	try {
		const hash = actionTokenService.hashToken(token);
		const tokenRow = actionTokenService.validateToken(hash);
		if (!tokenRow || tokenRow.purpose !== 'recovery') {
			auditService.log('reset', 'unknown', getIP(req), 'invalid token');
			return res.status(400).json({ error: 'Token de acción inválido o expirado.' });
		}
		
		db.transaction(() => {
			actionTokenService.consumeToken(hash);
			passwordService.resetPassword(tokenRow.email, password);
			// Invalidate all sessions after password reset (Reliability/Security)
			passwordService.invalidateSessions(tokenRow.email);
			auditService.log('reset', tokenRow.email, getIP(req), 'success');
		})();
		
		return res.json({ message: 'Contraseña restablecida con éxito.' });
	} catch (e) {
		return res.status(500).json({ error: 'Internal error.' });
	}
});

// Validate reset token endpoint
app.post('/validate-token', (req, res) => {
	const { token } = req.body;
	if (!token) return res.status(400).json({ error: 'Token requerido.' });
	const tokenHash = tokenService.hashToken(token);
	const tokenRow = tokenService.validateToken(tokenHash);
	if (!tokenRow) return res.status(400).json({ error: 'Token inválido o expirado.' });
	return res.json({ valid: true });
});

app.get('/validate-session', (req, res) => {
	const session = requireSession(req, res);
	if (!session) return;
	res.json({ valid: true, email: session.email });
});

// Endpoint: Sensitive actions protected by verification
app.post('/action/change-password', async (req, res) => {
	const { actionToken, newPassword } = req.body;
	if (!actionToken || !newPassword) return res.status(400).json({ error: 'actionToken and newPassword required.' });
	if (!passwordRegex.test(newPassword)) return res.status(400).json({ error: 'Password does not meet policy.' });
	try {
		const hash = actionTokenService.hashToken(actionToken);
		const tokenRow = actionTokenService.validateToken(hash);
		if (!tokenRow || tokenRow.purpose !== 'change-password') return res.status(400).json({ error: 'Token de acción inválido o expirado.' });
		
		db.transaction(() => {
			// Consume token so it cannot be reused
			actionTokenService.consumeToken(hash);
			passwordService.resetPassword(tokenRow.email, newPassword);
			passwordService.invalidateSessions(tokenRow.email);
			auditService.log('change-password', tokenRow.email, getIP(req), 'success');
		})();
		
		return res.json({ message: 'Contraseña cambiada con éxito.' });
	} catch (e) {
		return res.status(500).json({ error: 'Error interno.' });
	}
});

app.post('/action/change-email', async (req, res) => {
	const { actionToken, newEmail } = req.body;
	if (!actionToken || !newEmail) return res.status(400).json({ error: 'actionToken and newEmail required.' });
	if (!emailRegex.test(newEmail)) return res.status(400).json({ error: 'Invalid email format.' });
	try {
		const hash = actionTokenService.hashToken(actionToken);
		const tokenRow = actionTokenService.validateToken(hash);
		if (!tokenRow || tokenRow.purpose !== 'update-email') return res.status(400).json({ error: 'Token de acción inválido o expirado.' });
		if (passwordService.userExists(newEmail)) return res.status(409).json({ error: 'Email ya en uso.' });
		
		db.transaction(() => {
			// Consume token so it cannot be reused
			actionTokenService.consumeToken(hash);
			// Update email and clean up any tokens tied to the old email
			const oldEmail = tokenRow.email;
			const updateEmail = db.prepare('UPDATE users SET email = ? WHERE email = ?');
			updateEmail.run(newEmail, oldEmail);
			db.prepare('DELETE FROM reset_tokens WHERE email = ?').run(oldEmail);
			db.prepare('DELETE FROM verification_codes WHERE email = ?').run(oldEmail);
			db.prepare('DELETE FROM action_tokens WHERE email = ?').run(oldEmail);
			passwordService.invalidateSessions(newEmail);
			auditService.log('change-email', oldEmail, getIP(req), `to=${newEmail}`);
		})();
		
		return res.json({ message: 'Email actualizado con éxito.' });
	} catch (e) {
		return res.status(500).json({ error: 'Error interno.' });
	}
});

app.post('/action/unlock-account', async (req, res) => {
	const { actionToken } = req.body;
	if (!actionToken) return res.status(400).json({ error: 'actionToken required.' });
	try {
		const hash = actionTokenService.hashToken(actionToken);
		const tokenRow = actionTokenService.validateToken(hash);
		if (!tokenRow || tokenRow.purpose !== 'unlock-account') return res.status(400).json({ error: 'Token de acción inválido o expirado.' });
		
		db.transaction(() => {
			actionTokenService.consumeToken(hash);
			passwordService.unlockUser(tokenRow.email);
			rateLimiter.resetLimit(getIP(req), 'login'); // <--- CLEAR RATE LIMIT
			auditService.log('unlock-account', tokenRow.email, getIP(req), 'success');
		})();
		
		return res.json({ message: 'Cuenta desbloqueada con éxito.' });
	} catch (e) {
		return res.status(500).json({ error: 'Error interno.' });
	}
});

app.post('/action/logout-all', async (req, res) => {
	const { actionToken } = req.body;
	if (!actionToken) return res.status(400).json({ error: 'actionToken required.' });
	try {
		const hash = actionTokenService.hashToken(actionToken);
		const tokenRow = actionTokenService.validateToken(hash);
		if (!tokenRow || tokenRow.purpose !== 'logout-all') return res.status(400).json({ error: 'Token de acción inválido o expirado.' });
		
		db.transaction(() => {
			actionTokenService.consumeToken(hash);
			passwordService.invalidateSessions(tokenRow.email);
			auditService.log('logout-all', tokenRow.email, getIP(req), 'success');
		})();
		
		return res.json({ message: 'Todas las sesiones cerradas con éxito.' });
	} catch (e) {
		return res.status(500).json({ error: 'Error interno.' });
	}
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`API listening on port ${PORT}`);
});
