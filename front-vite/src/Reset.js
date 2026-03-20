// Reset page migrated to Vite
export function Reset() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Enter New Password</h1>
    <div id="policy" class="message" style="margin-bottom: 16px;"></div>
    <div id="tokenError" class="message" style="color: red; margin-bottom: 16px; display: none;"></div>
    <form id="resetForm" style="display: none;">
      <div class="password-container">
        <input type="password" name="newPassword" placeholder="New Password" required>
        <button type="button" class="toggle-password">Show</button>
      </div>
      <div class="password-container">
        <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
        <button type="button" class="toggle-password">Show</button>
      </div>
      <button type="submit">Reset Password</button>
    </form>
  `;

  // Support token from hash or search
  let token = null;
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  token = hashParams.get('token');
  if (!token) {
    token = new URLSearchParams(window.location.search).get('token');
  }

  // Validate token with backend
  fetch(import.meta.env.VITE_API_URL + '/validate-token', {
    method: 'POST',
    body: new URLSearchParams({ token }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        container.querySelector('#resetForm').style.display = '';
        container.querySelector('#tokenError').style.display = 'none';
      } else {
        container.querySelector('#resetForm').style.display = 'none';
        container.querySelector('#tokenError').innerText = data.error || 'Invalid or expired token.';
        container.querySelector('#tokenError').style.display = '';
      }
    })
    .catch(() => {
      container.querySelector('#resetForm').style.display = 'none';
      container.querySelector('#tokenError').innerText = 'Invalid or expired token.';
      container.querySelector('#tokenError').style.display = '';
    });

  // Fetch password policy from backend
  fetch(import.meta.env.VITE_API_URL + '/policy')
    .then(res => res.json())
    .then(data => {
      container.querySelector('#policy').innerText = data.policy || 'Password must meet the required policy.';
    })
    .catch(() => {
      container.querySelector('#policy').innerText = 'Password must meet the required policy.';
    });

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

  container.querySelector('#resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = container.querySelector('#policy');
    const data = new URLSearchParams();
    data.append('token', token);
    data.append('password', e.target.newPassword.value);
    if (e.target.newPassword.value !== e.target.confirmPassword.value) {
      messageDiv.innerText = 'Passwords do not match.';
      messageDiv.style.color = 'red';
      return;
    }
    const res = await fetch(import.meta.env.VITE_API_URL + '/reset', {
      method: 'POST',
      body: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const result = await res.json();
    if (result.error) {
      messageDiv.innerText = result.error;
      messageDiv.style.color = 'red';
    } else if (result.message) {
      messageDiv.innerText = result.message;
      messageDiv.style.color = 'green';
      setTimeout(() => {
        window.location.hash = '#login';
      }, 1500);
    }
  });

  return container;
}
