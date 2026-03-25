// Unlock account flow (for locked users who cannot log in)
export function Unlock() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Desbloquear Cuenta</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>

    <div id="step-send">
      <p>Ingresa tu correo para recibir un código de verificación y desbloquear tu cuenta.</p>
      <form id="sendForm">
        <input type="text" name="email" placeholder="Correo electrónico" required>
        <button type="submit">Enviar código de verificación</button>
      </form>
    </div>

    <div id="step-verify" style="display: none;">
      <p>Ingresa el código de verificación de 6 dígitos enviado a tu correo.</p>
      <form id="verifyForm">
        <input type="text" name="code" placeholder="Código de verificación" required>
        <button type="submit">Desbloquear cuenta</button>
      </form>
    </div>

    <div style="margin-top: 16px;">
      <a href="#login">Volver al inicio</a>
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
      setMessage('El correo es requerido.');
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, purpose: 'unlock-account' })
      });
      const result = await res.json();
      setMessage(result.message || result.error || 'Se envió un código.');
      if (res.ok) {
        stepSend.style.display = 'none';
        stepVerify.style.display = '';
      }
    } catch (err) {
      setMessage('Error de red.');
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
        body: new URLSearchParams({ email, purpose: 'unlock-account', code })
      });
      const result = await res.json();
      if (res.ok && result.verified) {
        const actionToken = result.actionToken;
        setMessage('¡Código verificado! Desbloqueando...');
        const unlockRes = await fetch(import.meta.env.VITE_API_URL + '/action/unlock-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ actionToken })
        });
        const unlockResult = await unlockRes.json();
        if (unlockRes.ok) {
          setMessage(unlockResult.message || 'Cuenta desbloqueada.');
          setTimeout(() => { window.location.hash = '#login'; }, 1500);
        } else {
          setMessage(unlockResult.error || 'Error al desbloquear.');
        }
      } else {
        setMessage(result.error || 'Código inválido.');
      }
    } catch (err) {
      setMessage('Error de red.');
    }
  });

  return container;
}
