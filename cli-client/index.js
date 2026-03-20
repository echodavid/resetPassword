#!/usr/bin/env node
import { Command } from 'commander';
import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const apiUrl = config.apiUrl;

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function mainMenu() {
  console.log('\nPassword Reset CLI');
  console.log('1. Request password reset email');
  console.log('2. Reset password with token');
  console.log('3. Login');
  console.log('4. Register');
  console.log('5. Change password (verification code)');
  console.log('6. Change email (verification code)');
  console.log('7. Unlock account (verification code)');
  console.log('0. Exit');
  const choice = await prompt('Choose an option: ');
  if (choice === '1') {
    const email = await prompt('Enter your email: ');
    try {
      const res = await fetch(`${apiUrl}/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }
    await mainMenu();
  } else if (choice === '2') {
    const token = await prompt('Enter your reset token: ');
    const password = await prompt('Enter new password: ');
    const confirmPassword = await prompt('Confirm new password: ');
    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      await mainMenu();
      return;
    }
    // Strip whitespace and validate token input
    const cleanToken = token.trim();
    if (!cleanToken) {
      console.error('Token cannot be empty');
      await mainMenu();
      return;
    }
    // Validate token before reset
    try {
      const validateRes = await fetch(`${apiUrl}/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: cleanToken })
      });
      const validateResult = await validateRes.json();
      if (!validateResult.valid) {
        console.error(validateResult.error || 'Invalid or expired token');
        await mainMenu();
        return;
      }
    } catch (err) {
      console.error('Error validating token:', err.message);
      await mainMenu();
      return;
    }
    // Proceed with reset
    try {
      const res = await fetch(`${apiUrl}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: cleanToken, password })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }
    await mainMenu();
  } else if (choice === '3') {
    const email = await prompt('Enter your email: ');
    const password = await prompt('Enter your password: ');
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }
    await mainMenu();
  } else if (choice === '4') {
    const email = await prompt('Enter your email: ');
    const password = await prompt('Enter your password: ');
    const confirmPassword = await prompt('Confirm your password: ');
    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      await mainMenu();
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }
    await mainMenu();
  } else if (choice === '5') {
    const email = await prompt('Enter your email: ');
    try {
      const sendRes = await fetch(`${apiUrl}/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'change-password' })
      });
      const sendResult = await sendRes.json();
      console.log(sendResult.message || sendResult.error || 'If the account exists, a code was sent.');
    } catch (err) {
      console.error('Error sending verification code:', err.message);
      await mainMenu();
      return;
    }

    const code = await prompt('Enter the verification code: ');
    let actionToken;
    try {
      const checkRes = await fetch(`${apiUrl}/verify/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'change-password', code })
      });
      const checkResult = await checkRes.json();
      if (!checkResult.verified) {
        console.error(checkResult.error || 'Verification failed.');
        await mainMenu();
        return;
      }
      actionToken = checkResult.actionToken;
    } catch (err) {
      console.error('Error verifying code:', err.message);
      await mainMenu();
      return;
    }

    const newPassword = await prompt('Enter your new password: ');
    const confirmPassword = await prompt('Confirm your new password: ');
    if (newPassword !== confirmPassword) {
      console.error('Passwords do not match');
      await mainMenu();
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/action/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ actionToken, newPassword })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }

    await mainMenu();
  } else if (choice === '6') {
    const email = await prompt('Enter your current email: ');
    try {
      const sendRes = await fetch(`${apiUrl}/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'update-email' })
      });
      const sendResult = await sendRes.json();
      console.log(sendResult.message || sendResult.error || 'If the account exists, a code was sent.');
    } catch (err) {
      console.error('Error sending verification code:', err.message);
      await mainMenu();
      return;
    }

    const code = await prompt('Enter the verification code: ');
    let actionToken;
    try {
      const checkRes = await fetch(`${apiUrl}/verify/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'update-email', code })
      });
      const checkResult = await checkRes.json();
      if (!checkResult.verified) {
        console.error(checkResult.error || 'Verification failed.');
        await mainMenu();
        return;
      }
      actionToken = checkResult.actionToken;
    } catch (err) {
      console.error('Error verifying code:', err.message);
      await mainMenu();
      return;
    }

    const newEmail = await prompt('Enter your new email: ');
    if (!newEmail) {
      console.error('New email cannot be empty');
      await mainMenu();
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/action/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ actionToken, newEmail })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }

    await mainMenu();
  } else if (choice === '7') {
    const email = await prompt('Enter your email: ');
    try {
      const sendRes = await fetch(`${apiUrl}/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'unlock-account' })
      });
      const sendResult = await sendRes.json();
      console.log(sendResult.message || sendResult.error || 'If the account exists, a code was sent.');
    } catch (err) {
      console.error('Error sending verification code:', err.message);
      await mainMenu();
      return;
    }

    const code = await prompt('Enter the verification code: ');
    let actionToken;
    try {
      const checkRes = await fetch(`${apiUrl}/verify/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'unlock-account', code })
      });
      const checkResult = await checkRes.json();
      if (!checkResult.verified) {
        console.error(checkResult.error || 'Verification failed.');
        await mainMenu();
        return;
      }
      actionToken = checkResult.actionToken;
    } catch (err) {
      console.error('Error verifying code:', err.message);
      await mainMenu();
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/action/unlock-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ actionToken })
      });
      const result = await res.json();
      console.log(result.message || result.error);
    } catch (err) {
      console.error('Error:', err.message);
    }

    await mainMenu();
  } else if (choice === '0') {
    console.log('Goodbye!');
    process.exit(0);
  } else {
    console.log('Invalid option.');
    await mainMenu();
  }
}

mainMenu();
