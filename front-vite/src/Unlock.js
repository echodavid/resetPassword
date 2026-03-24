// Unlock account flow (for locked users who cannot log in)
export function Unlock() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Unlock Account</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>

    <div id="step-send">
      <p>Enter your email to receive a verification code to unlock your account.</p>
      <form id="sendForm">
        <input type="text" name="email" placeholder="Email" required>
        <button type="submit">Send verification code</button>
      </form>
    </div>

    <div id="step-verify" style="display: none;">
      <p>Enter the 6-digit verification code sent to your email.</p>
      <form id="verifyForm">
        <input type="text" name="code" placeholder="Verification code" required>
        <button type="submit">Unlock account</button>
      </form>
    </div>

    <div style="margin-top: 16px;">
      <a href="#login">Back to login</a>
    </div>
  `;

  const messageEl = container.querySelector('#message');
  const sendForm = container.querySelector('#sendForm');
  const verifyForm = container.querySelector('#verifyForm');
  const stepSend = container.querySelector('#step-send');
  const stepVerify = container.querySelector('#step-verify');

  const setMessage = (text) => {
    messageEl.innerText = text;
    messageEl.style.fontWeight = 'bold';
  };

  let email = '';

  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    email = e.target.email.value.trim();
    if (!email) {
      setMessage('Email is required.');
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'unlock-account' })
      });
      const result = await res.json();
      setMessage(result.message || result.error || 'A code was sent.');
      if (res.ok) {
        stepSend.style.display = 'none';
        stepVerify.style.display = '';
      }
    } catch (err) {
      setMessage('Network error.');
    }
  });

  verifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim();
    if (!code) {
      setMessage('Enter the verification code.');
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'unlock-account', code })
      });
      const result = await res.json();
      if (res.ok && result.verified) {
        const actionToken = result.actionToken;
        setMessage('Code verified! Unlocking...');
        const unlockRes = await fetch(import.meta.env.VITE_API_URL + '/action/unlock-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ actionToken })
        });
        const unlockResult = await unlockRes.json();
        if (unlockRes.ok) {
          setMessage(unlockResult.message || 'Account unlocked.');
          setTimeout(() => { window.location.hash = '#login'; }, 1500);
        } else {
          setMessage(unlockResult.error || 'Failed to unlock.');
        }
      } else {
        setMessage(result.error || 'Invalid code.');
      }
    } catch (err) {
      setMessage('Network error.');
    }
  });

  return container;
}
