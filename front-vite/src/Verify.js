// Verify page: send/confirm verification code and then perform a sensitive action (change password)
export function Verify() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Verificar Identidad</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>

    <div id="step-send">
      <p>Selecciona la acción que deseas realizar y proporciona el correo de tu cuenta.</p>
      <form id="sendForm">
        <label>
          Acción:
          <select name="purpose">
            <option value="change-password">Restablecer Contraseña</option>
            <option value="update-email">Actualizar Correo</option>
            <option value="logout-all">Cerrar Sesión en Todos Lados</option>
            <option value="unlock-account">Desbloquear Cuenta</option>
          </select>
        </label>
        <input type="text" name="email" placeholder="Correo electrónico" required>
        <button type="submit">Enviar código de verificación</button>
      </form>
    </div>

    <div id="step-verify" style="display: none;">
      <p>Ingresa el código de verificación de 6 dígitos que enviamos a tu correo.</p>
      <form id="verifyForm">
        <input type="text" name="code" placeholder="Código de verificación" required>
        <button type="submit">Verificar código</button>
      </form>
    </div>

    <div id="step-action" style="display: none;">
      <p id="actionPrompt">Establece una nueva contraseña para tu cuenta:</p>
      <form id="actionForm">
        <div id="action-password" class="action-block">
          <div class="password-container">
            <input type="password" name="newPassword" placeholder="Nueva contraseña" required>
            <button type="button" class="toggle-password">Ver</button>
          </div>
          <div class="password-container">
            <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" required>
            <button type="button" class="toggle-password">Ver</button>
          </div>
        </div>
        <div id="action-email" class="action-block" style="display:none;">
          <input type="email" name="newEmail" placeholder="Nuevo correo" required>
        </div>
        <button type="submit">Ejecutar acción</button>
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

  const setMessage = (text) => {
    messageEl.innerText = text;
    messageEl.style.fontWeight = 'bold';
    messageEl.style.color = 'black';
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
  
  const hash = window.location.hash || '';
  const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  let purpose = searchParams.get('purpose') || 'change-password';
  let urlEmail = searchParams.get('email') || localStorage.getItem('userEmail') || '';

  if (searchParams.has('purpose')) {
    const selector = container.querySelector('select[name="purpose"]');
    if (selector) selector.value = purpose;
    const label = container.querySelector('label');
    if (label) label.style.display = 'none'; // Hide choice if already in URL
  }
  if (urlEmail) {
    const emailInput = container.querySelector('input[name="email"]');
    if (emailInput) emailInput.value = urlEmail;
  }

  const showActionFields = () => {
    const passwordBlock = container.querySelector('#action-password');
    const emailBlock = container.querySelector('#action-email');
    const prompt = container.querySelector('#actionPrompt');
    const submitBtn = container.querySelector('#actionForm button[type="submit"]');

    const newPasswordInput = container.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');
    const newEmailInput = container.querySelector('input[name="newEmail"]');

    if (purpose === 'update-email') {
      passwordBlock.style.display = 'none';
      emailBlock.style.display = '';
      prompt.innerText = 'Confirma la nueva dirección de correo:';
      submitBtn.innerText = 'Actualizar Correo';
      newPasswordInput.disabled = true;
      confirmPasswordInput.disabled = true;
      newEmailInput.disabled = false;
    } else if (purpose === 'logout-all') {
      passwordBlock.style.display = 'none';
      emailBlock.style.display = 'none';
      prompt.innerText = 'Presiona abajo para cerrar sesión en todas las sesiones activas.';
      submitBtn.innerText = 'Cerrar Todas las Sesiones';
      newPasswordInput.disabled = true;
      confirmPasswordInput.disabled = true;
      newEmailInput.disabled = true;
    } else if (purpose === 'unlock-account') {
      passwordBlock.style.display = 'none';
      emailBlock.style.display = 'none';
      prompt.innerText = 'Presiona abajo para desbloquear esta cuenta.';
      submitBtn.innerText = 'Desbloquear Cuenta';
      newPasswordInput.disabled = true;
      confirmPasswordInput.disabled = true;
      newEmailInput.disabled = true;
    } else {
      passwordBlock.style.display = '';
      emailBlock.style.display = 'none';
      prompt.innerText = 'Establece una nueva contraseña para tu cuenta:';
      submitBtn.innerText = 'Restablecer Contraseña';
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
      setMessage('El correo es requerido.');
      return;
    }
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: savedEmail, purpose })
      });
      const result = await res.json();
      setMessage(result.message || result.error || 'Se envió un código si la cuenta existe.');
      stepSend.style.display = 'none';
      stepVerify.style.display = '';
    } catch (err) {
      setMessage('Error al enviar el código de verificación.');
    }
  });

  verifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim();
    if (!code) {
      setMessage('Ingresa el código de verificación.');
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
        setMessage('¡Verificado! Ahora puedes proceder.');
        stepVerify.style.display = 'none';
        showActionFields();
        stepAction.style.display = '';
      } else {
        setMessage(result.error || 'Código inválido.');
      }
    } catch (err) {
      setMessage('Error al verificar el código.');
    }
  });

  actionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = actionForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    if (!actionToken) {
      setMessage('Falta el token de acción. Por favor verifica el código de nuevo.');
      submitButton.disabled = false;
      return;
    }

    let body;
    let endpoint;

    if (purpose === 'update-email') {
      const newEmail = e.target.newEmail.value.trim();
      if (!newEmail) {
        setMessage('El nuevo correo es requerido.');
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
        setMessage('Las contraseñas no coinciden.');
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
        setMessage(result.message);
        // Hide the form to show final state clearly
        stepAction.style.display = 'none';
      } else {
        setMessage(result.error || `No se pudo completar la acción (estado ${res.status}).`);
      }
    } catch (err) {
      setMessage('Error al completar la acción.');
    }
    submitButton.disabled = false;
  });

  return container;
}
