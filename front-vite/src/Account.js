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

  container.innerHTML = `
    <h1>My Account</h1>
    <p>Logged in as <strong>${userEmail}</strong></p>

    <div class="account-actions">
      <button id="changePasswordBtn">Change password</button>
      <button id="changeEmailBtn">Change email</button>
      <button id="logoutAllBtn">Logout all sessions</button>
      <button id="unlockAccountBtn">Unlock account</button>
    </div>

    <button id="logoutBtn" style="margin-top: 16px;">Logout</button>
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
    window.location.hash = '#verify?purpose=change-password';
  });
  container.querySelector('#changeEmailBtn').addEventListener('click', () => {
    window.location.hash = '#verify?purpose=update-email';
  });
  container.querySelector('#logoutAllBtn').addEventListener('click', () => {
    window.location.hash = '#verify?purpose=logout-all';
  });
  container.querySelector('#unlockAccountBtn').addEventListener('click', () => {
    window.location.hash = '#verify?purpose=unlock-account';
  });
  container.querySelector('#logoutBtn').addEventListener('click', logout);

  return container;
}
