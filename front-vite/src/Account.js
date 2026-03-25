// Account page shown after successful login
export function Account() {
  const container = document.createElement('div');
  container.className = 'container';

  const sessionToken = localStorage.getItem('sessionToken');
  const userEmail = localStorage.getItem('userEmail');
  if (!sessionToken || !userEmail) {
    window.location.hash = '#login';
    return container;
  }

  // Verify session validity with server
  fetch(import.meta.env.VITE_API_URL + '/validate-session', {
    headers: { Authorization: `Bearer ${sessionToken}` }
  }).then(res => {
    if (res.status === 401) logout();
  });

  container.innerHTML = `
    <h1>Mi Cuenta</h1>
    <p>Sesión iniciada como <strong>${userEmail}</strong></p>

    <div class="account-actions">
      <button id="changePasswordBtn">Cambiar contraseña</button>
      <button id="changeEmailBtn">Cambiar correo</button>
      <button id="logoutAllBtn">Cerrar todas las sesiones</button>
      <button id="unlockAccountBtn">Desbloquear cuenta</button>
    </div>

    <button id="logoutBtn" style="margin-top: 16px;">Cerrar Sesión</button>
  `;

  const logout = async () => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      await fetch(import.meta.env.VITE_API_URL + '/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userEmail');
    window.location.hash = '#login';
  };

  container.querySelector('#changePasswordBtn').addEventListener('click', () => {
    window.location.hash = `#verify?purpose=change-password&email=${userEmail}`;
  });
  container.querySelector('#changeEmailBtn').addEventListener('click', () => {
    window.location.hash = `#verify?purpose=update-email&email=${userEmail}`;
  });
  container.querySelector('#logoutAllBtn').addEventListener('click', () => {
    window.location.hash = `#verify?purpose=logout-all&email=${userEmail}`;
  });
  container.querySelector('#unlockAccountBtn').addEventListener('click', () => {
    window.location.hash = `#verify?purpose=unlock-account&email=${userEmail}`;
  });
  container.querySelector('#logoutBtn').addEventListener('click', logout);

  return container;
}
