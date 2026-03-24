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

let currentToken = null;

async function mainMenu() {
  console.log('\n--- PASSWORD RESET CLI ---');
  console.log('1. LOGIN');
  console.log('2. REGISTER');
  console.log('3. FORGOT PASSWORD (REQUEST CODE)');
  console.log('4. UNLOCK ACCOUNT (VERIFICATION CODE)');
  console.log('0. EXIT');
  
  const choice = await prompt('\nCHOOSE AN OPTION: ');
  
  if (choice === '1') {
    const email = await prompt('EMAIL: ');
    const password = await prompt('PASSWORD: ');
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password })
      });
      const result = await res.json();
      if (res.ok && result.sessionToken) {
        console.log('\nLOGIN SUCCESSFUL.');
        currentToken = result.sessionToken;
        await accountMenu(email, result.sessionToken);
      } else {
        console.log(`\nERROR: ${result.error || 'Login failed.'}`);
        await mainMenu();
      }
    } catch (err) {
      console.error('\nNETWORK ERROR:', err.message);
      await mainMenu();
    }
  } else if (choice === '2') {
    const email = await prompt('EMAIL: ');
    const password = await prompt('PASSWORD: ');
    const confirm = await prompt('CONFIRM PASSWORD: ');
    if (password !== confirm) {
      console.log('\nERROR: PASSWORDS DO NOT MATCH.');
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
      console.log(`\n${result.message || result.error}`);
    } catch (err) {
      console.error('\nERROR:', err.message);
    }
    await mainMenu();
  } else if (choice === '3') {
    const email = await prompt('EMAIL: ');
    try {
      const res = await fetch(`${apiUrl}/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email })
      });
      const result = await res.json();
      console.log(`\n${result.message || result.error}`);
      if (res.ok) {
        console.log('\nPROCEEDING TO RESET STEP...');
        await resetPasswordFlow(email);
      }
    } catch (err) {
      console.error('\nERROR:', err.message);
    }
    await mainMenu();
  } else if (choice === '4') {
    await verificationWorkflow('unlock-account');
    await mainMenu();
  } else if (choice === '0') {
    console.log('\nGOODBYE.');
    process.exit(0);
  } else {
    console.log('\nINVALID OPTION.');
    await mainMenu();
  }
}

async function accountMenu(email, sessionToken) {
  console.log(`\n--- LOGGED IN AS: ${email.toUpperCase()} ---`);
  console.log('1. CHANGE PASSWORD');
  console.log('2. CHANGE EMAIL');
  console.log('3. SIGN OUT FROM EVERYWHERE');
  console.log('4. LOGOUT (CURRENT SESSION)');
  console.log('0. BACK');

  const choice = await prompt('\nCHOOSE AN OPTION: ');

  if (choice === '1') {
    await verificationWorkflow('change-password', email);
    await accountMenu(email, sessionToken);
  } else if (choice === '2') {
    await verificationWorkflow('update-email', email);
    await accountMenu(email, sessionToken);
  } else if (choice === '3') {
    await verificationWorkflow('logout-all', email);
    await mainMenu(); // Version bumped, token invalidated
  } else if (choice === '4') {
    console.log('\nLOGGING OUT...');
    await mainMenu();
  } else if (choice === '0') {
    await mainMenu();
  } else {
    console.log('\nINVALID OPTION.');
    await accountMenu(email, sessionToken);
  }
}

async function resetPasswordFlow(email) {
  const code = await prompt('ENTER THE RECOVERY CODE: ');
  try {
    const checkRes = await fetch(`${apiUrl}/verify/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, purpose: 'recovery', code })
    });
    const checkResult = await checkRes.json();
    if (!checkResult.verified) {
      console.log(`\nERROR: ${checkResult.error || 'Verification failed.'}`);
      return;
    }
    
    const password = await prompt('ENTER NEW PASSWORD: ');
    const confirm = await prompt('CONFIRM NEW PASSWORD: ');
    if (password !== confirm) {
      console.log('\nERROR: PASSWORDS DO NOT MATCH.');
      return;
    }

    const res = await fetch(`${apiUrl}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: checkResult.actionToken, password })
    });
    const result = await res.json();
    console.log(`\n${result.message || result.error}`);
  } catch (err) {
    console.error('\nERROR:', err.message);
  }
}

async function verificationWorkflow(purpose, prefilledEmail = null) {
  const email = prefilledEmail || await prompt('ENTER EMAIL: ');
  
  try {
    const sendRes = await fetch(`${apiUrl}/verify/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, purpose })
    });
    const sendResult = await sendRes.json();
    console.log(`\n${sendResult.message || sendResult.error}`);
    if (!sendRes.ok) return;

    const code = await prompt('ENTER VERIFICATION CODE: ');
    const checkRes = await fetch(`${apiUrl}/verify/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, purpose, code })
    });
    const checkResult = await checkRes.json();
    if (!checkResult.verified) {
      console.log(`\nERROR: ${checkResult.error || 'Verification failed.'}`);
      return;
    }

    const actionToken = checkResult.actionToken;
    let endpoint;
    let body = new URLSearchParams({ actionToken });

    if (purpose === 'change-password') {
      endpoint = '/action/change-password';
      const newPassword = await prompt('ENTER NEW PASSWORD: ');
      const confirm = await prompt('CONFIRM NEW PASSWORD: ');
      if (newPassword !== confirm) {
        console.log('\nERROR: PASSWORDS DO NOT MATCH.');
        return;
      }
      body.append('newPassword', newPassword);
    } else if (purpose === 'update-email') {
      endpoint = '/action/change-email';
      const newEmail = await prompt('ENTER NEW EMAIL: ');
      body.append('newEmail', newEmail);
    } else if (purpose === 'unlock-account') {
      endpoint = '/action/unlock-account';
    } else if (purpose === 'logout-all') {
      endpoint = '/action/logout-all';
    }

    const res = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${currentToken}` 
      },
      body
    });
    if (res.status === 401) {
      console.log('\nSESSION EXPIRED OR REVOKED. PLEASE LOGIN AGAIN.');
      currentToken = null;
      await mainMenu();
      return;
    }
    const result = await res.json();
    console.log(`\n${result.message || result.error}`);
  } catch (err) {
    console.error('\nERROR:', err.message);
  }
}

mainMenu();
