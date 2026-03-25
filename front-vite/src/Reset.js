// Reset page: verification-based recovery
export function Reset() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Reset Password</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>

    <div id="step-verify">
      <p>Enter your email and the 6-digit recovery code sent to you.</p>
      <form id="verifyForm">
        <input type="email" name="email" placeholder="Email" required style="margin-bottom: 8px;">
        <input type="text" name="code" placeholder="Recovery code" required style="margin-bottom: 16px;">
        <button type="submit">Verify Code</button>
      </form>
    </div>

    <div id="step-action" style="display: none;">
      <p>Set your new password:</p>
      <form id="actionForm">
        <div class="password-container">
          <input type="password" name="newPassword" placeholder="New password" required>
          <button type="button" class="toggle-password">Show</button>
        </div>
        <div class="password-container">
          <input type="password" name="confirmPassword" placeholder="Confirm password" required>
          <button type="button" class="toggle-password">Show</button>
        </div>
        <button type="submit">Update Password</button>
      </form>
    </div>
  `;

  const messageEl = container.querySelector('#message');
  const verifyForm = container.querySelector('#verifyForm');
  const actionForm = container.querySelector('#actionForm');
  const stepVerify = container.querySelector('#step-verify');
  const stepAction = container.querySelector('#step-action');

  let savedEmail = '';
  let actionToken = null;

  const setMessage = (text) => {
    messageEl.innerText = text;
    messageEl.style.fontWeight = 'bold';
  };

  // Pre-fill from URL parameters (#reset?email=...&code=...)
  const hash = window.location.hash || '';
  const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const urlEmail = searchParams.get('email');
  const urlCode = searchParams.get('code');

  if (urlEmail) verifyForm.email.value = urlEmail;
  if (urlCode) verifyForm.code.value = urlCode;

  const openEye = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2.5c-3.5 0-6.5 2-8 4.5 1.5 2.5 4.5 4.5 8 4.5s6.5-2 8-4.5c-1.5-2.5-4.5-4.5-8-4.5zM8 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/><circle cx="8" cy="8" r="1.5"/></svg>`;
  const closedEye = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2.5c-3.5 0-6.5 2-8 4.5 1.5 2.5 4.5 4.5 8 4.5s6.5-2 8-4.5c-1.5-2.5-4.5-4.5-8-4.5z"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  container.querySelectorAll('.toggle-password').forEach(button => {
    const input = button.previousElementSibling;
    button.innerHTML = input.type === 'password' ? openEye : closedEye;
    button.addEventListener('click', function() {
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = closedEye;
      } else {
        input.type = 'password';
        this.innerHTML = openEye;
      }
    });
  });

  verifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    savedEmail = e.target.email.value.trim();
    const code = e.target.code.value.trim();
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: savedEmail, purpose: 'recovery', code })
      });
      const result = await res.json();
      if (result.verified) {
        actionToken = result.actionToken;
        setMessage('¡Código verificado! Ahora establece tu nueva contraseña.', 'green');
        stepVerify.style.display = 'none';
        stepAction.style.display = '';
      } else {
        setMessage(result.error || 'Código inválido.', 'red');
      }
    } catch (err) {
      setMessage('Error de red.', 'red');
    }
  });

  actionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = e.target.newPassword.value;
    const confirm = e.target.confirmPassword.value;
    if (password !== confirm) {
      setMessage('Las contraseñas no coinciden.', 'red');
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: actionToken, password })
      });
      const result = await res.json();
      if (res.ok) {
        setMessage(result.message, 'green');
        stepAction.style.display = 'none';
        setTimeout(() => { window.location.hash = '#login'; }, 2000);
      } else {
        setMessage(result.error || 'Error al actualizar la contraseña.', 'red');
      }
    } catch (err) {
      setMessage('Error de red.', 'red');
    }
  });

  return container;
}
