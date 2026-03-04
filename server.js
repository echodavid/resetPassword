require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Email transporter (configure with your email service)
// Email transporter (using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Initialize SQLite DB (in-memory for Heroku)
const db = new Database(':memory:');

// Create tables if not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    email TEXT,
    expires INTEGER
  );
`);

// Insert demo user if not exists
const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)');
insertUser.run('user@example.com', 'oldpass');

// Prepared statements
const getUser = db.prepare('SELECT * FROM users WHERE email = ?');
const insertToken = db.prepare('INSERT INTO reset_tokens (token, email, expires) VALUES (?, ?, ?)');
const getToken = db.prepare('SELECT * FROM reset_tokens WHERE token = ? AND expires > ?');
const updatePassword = db.prepare('UPDATE users SET password = ? WHERE email = ?');
const deleteToken = db.prepare('DELETE FROM reset_tokens WHERE token = ?');

app.get('/', (req, res) => res.redirect('/login'));

app.get('/forgot', (req, res) => res.sendFile(__dirname + '/public/forgot.html'));

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ error: 'Invalid email format.' });
  }
  const user = getUser.get(email);
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    insertToken.run(token, email, Date.now() + 3600000); // 1 hour
    const resetLink = `http://localhost:3000/reset?token=${token}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Click here to reset your password: ${resetLink}`
      });
      console.log(`Reset email sent to ${email}. Link: ${resetLink}`);
    } catch (error) {
      console.error('Error sending email:', error);
      return res.json({ error: 'Failed to send email.' });
    }
  }
  res.json({ message: 'If the email exists, a reset link has been sent.' });
});

app.get('/reset', (req, res) => {
  const { token } = req.query;
  const tokenRow = getToken.get(token, Date.now());
  if (tokenRow) {
    res.sendFile(__dirname + '/public/reset.html');
  } else {
    res.send('Invalid or expired token');
  }
});

app.post('/reset-password', (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword || newPassword.length < 12) {
    return res.json({ error: 'Password must be at least 12 characters and match confirmation.' });
  }
  const tokenRow = getToken.get(token, Date.now());
  if (tokenRow) {
    updatePassword.run(newPassword, tokenRow.email);
    deleteToken.run(token);
    console.log(`Password updated for ${tokenRow.email}. Sessions closed.`);
    res.json({ message: 'Password updated successfully.' });
  } else {
    res.json({ error: 'Invalid or expired token.' });
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ error: 'Invalid email format.' });
  }
  const user = getUser.get(email);
  if (user && user.password === password) {
    res.json({ message: 'Login successful.' });
  } else {
    res.json({ error: 'Invalid credentials.' });
  }
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ error: 'Invalid email format.' });
  }
  if (password !== confirmPassword || password.length < 12) {
    return res.json({ error: 'Password must be at least 12 characters and match confirmation.' });
  }
  try {
    insertUser.run(email, password);
    res.json({ message: 'Registration successful.' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.json({ error: 'Email already exists.' });
    } else {
      res.json({ error: 'Registration failed.' });
    }
  }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Server running on port', process.env.PORT || 3000));