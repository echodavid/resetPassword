// Verify page: send/confirm verification code and then perform a sensitive action (change password)
export function Verify() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Verify Identity</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>

    <div id="step-send">
      <p>Select the action you want to perform and provide the current account email.</p>
      <form id="sendForm">
        <label>
          Action:
          <select name="purpose">
            <option value="change-password">Change password</option>
            <option value="update-email">Change email</option>
          </select>
        </label>
        <input type="text" name="email" placeholder="Email" required>
        <button type="submit">Send verification code</button>
      </form>
    </div>

    <div id="step-verify" style="display: none;">
      <p>Enter the 6-digit verification code sent to your email.</p>
      <form id="verifyForm">
        <input type="text" name="code" placeholder="Verification code" required>
        <button type="submit">Verify code</button>
      </form>
    </div>

    <div id="step-action" style="display: none;">
      <p id="actionPrompt">Set a new password for your account:</p>
      <form id="actionForm">
        <div id="action-password" class="action-block">
          <div class="password-container">
            <input type="password" name="newPassword" placeholder="New password" required>
            <button type="button" class="toggle-password">Show</button>
          </div>
          <div class="password-container">
            <input type="password" name="confirmPassword" placeholder="Confirm password" required>
            <button type="button" class="toggle-password">Show</button>
          </div>
        </div>
        <div id="action-email" class="action-block" style="display:none;">
          <input type="email" name="newEmail" placeholder="New email" required>
        </div>
        <button type="submit">Execute action</button>
      </form>
    </div>
  `;

  const messageEl = container.querySelector('#message');
  const sendForm = container.querySelector('#sendForm');
  const verifyForm = container.querySelector('#verifyForm');
  const actionForm = container.querySelector('#actionForm');
  const stepSend = container.querySelector('#step-send');
  const stepVerify = container.querySelector('#step-verify');
  const stepAction = container.querySelector('#step-action');

  const openEye = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2.5c-3.5 0-6.5 2-8 4.5 1.5 2.5 4.5 4.5 8 4.5s6.5-2 8-4.5c-1.5-2.5-4.5-4.5-8-4.5zM8 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/><circle cx="8" cy="8" r="1.5"/></svg>`;
  const closedEye = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2.5c-3.5 0-6.5 2-8 4.5 1.5 2.5 4.5 4.5 8 4.5s6.5-2 8-4.5c-1.5-2.5-4.5-4.5-8-4.5z"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  const setMessage = (text, color = 'black') => {
    messageEl.innerText = text;
    messageEl.style.color = color;
  };

  const togglePasswordButtons = (containerEl) => {
    containerEl.querySelectorAll('.toggle-password').forEach(button => {
      const input = button.previousElementSibling;
      button.innerHTML = input.type === 'password' ? openEye : closedEye;
      button.addEventListener('click', () => {
        if (input.type === 'password') {
          input.type = 'text';
          button.innerHTML = closedEye;
        } else {
          input.type = 'password';
          button.innerHTML = openEye;
        }
      });
    });
  };

  togglePasswordButtons(stepAction);

  let savedEmail = '';
  let actionToken = null;
  let purpose = 'change-password';

  const showActionFields = () => {
    const passwordBlock = container.querySelector('#action-password');
    const emailBlock = container.querySelector('#action-email');
    const prompt = container.querySelector('#actionPrompt');
    const newPasswordInput = container.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const newEmailInput = container.querySelector('input[name="newEmail"]');

    if (purpose === 'update-email') {
      passwordBlock.style.display = 'none';
      emailBlock.style.display = '';
      prompt.innerText = 'Enter the new email address for your account:';
      newPasswordInput.disabled = true;
      confirmPasswordInput.disabled = true;
      newEmailInput.disabled = false;
    } else {
      passwordBlock.style.display = '';
      emailBlock.style.display = 'none';
      prompt.innerText = 'Set a new password for your account:';
      newPasswordInput.disabled = false;
      confirmPasswordInput.disabled = false;
      newEmailInput.disabled = true;
    }
  };

  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    purpose = e.target.purpose.value;
    savedEmail = e.target.email.value.trim();
    if (!savedEmail) {
      setMessage('Email is required.', 'red');
      return;
    }
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: savedEmail, purpose })
      });
      const result = await res.json();
      setMessage(result.message || result.error || 'A code was sent if the account exists.', 'black');
      stepSend.style.display = 'none';
      stepVerify.style.display = '';
    } catch (err) {
      setMessage('Failed to send verification code.', 'red');
    }
  });

  verifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim();
    if (!code) {
      setMessage('Enter the verification code.', 'red');
      return;
    }
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: savedEmail, purpose, code })
      });
      const result = await res.json();
      if (result.verified) {
        actionToken = result.actionToken;
        setMessage('Verified! You can now proceed.', 'green');
        stepVerify.style.display = 'none';
        showActionFields();
        stepAction.style.display = '';
      } else {
        setMessage(result.error || 'Invalid code.', 'red');
      }
    } catch (err) {
      setMessage('Failed to verify code.', 'red');
    }
  });

  actionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = actionForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    if (!actionToken) {
      setMessage('Missing action token. Please verify code again.', 'red');
      submitButton.disabled = false;
      return;
    }

    let body;
    let endpoint;

    if (purpose === 'update-email') {
      const newEmail = e.target.newEmail.value.trim();
      if (!newEmail) {
        setMessage('New email is required.', 'red');
        submitButton.disabled = false;
        return;
      }
      endpoint = '/action/change-email';
      body = new URLSearchParams({ actionToken, newEmail });
    } else if (purpose === 'logout-all') {
      endpoint = '/action/logout-all';
      body = new URLSearchParams({ actionToken });
    } else if (purpose === 'unlock-account') {
      endpoint = '/action/unlock-account';
      body = new URLSearchParams({ actionToken });
    } else {
      const newPassword = e.target.newPassword.value;
      const confirmPassword = e.target.confirmPassword.value;
      if (newPassword !== confirmPassword) {
        setMessage('Passwords do not match.', 'red');
        submitButton.disabled = false;
        return;
      }
      endpoint = '/action/change-password';
      body = new URLSearchParams({ actionToken, newPassword });
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      const result = await res.json();
      if (res.ok && result.message) {
        setMessage(result.message, 'green');
        // Hide the form to show final state clearly
        stepAction.style.display = 'none';
      } else {
        setMessage(result.error || `Could not complete action (status ${res.status}).`, 'red');
      }
    } catch (err) {
      setMessage('Failed to complete action.', 'red');
    }

    submitButton.disabled = false;
  });

  return container;
}
