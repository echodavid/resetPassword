// Register page migrated to Vite
export function Register() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Register</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>
    <div id="policy" class="message" style="margin-bottom: 16px; font-size: 0.85em;"></div>
    <form id="registerForm">
      <input type="text" name="email" placeholder="Email" required>
      <div class="password-container">
        <input type="password" name="password" placeholder="Password" required>
        <button type="button" class="toggle-password">Show</button>
      </div>
      <div class="password-container">
        <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
        <button type="button" class="toggle-password">Show</button>
      </div>
      <button type="submit">Register</button>
    </form>
    <p><a href="#login">Already have an account? Login</a></p>
  `;

  const messageEl = container.querySelector('#message');
  const setMessage = (text) => {
    messageEl.innerText = text;
    messageEl.style.fontWeight = 'bold';
  };

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

  container.querySelector('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new URLSearchParams();
    data.append('email', e.target.email.value);
    data.append('password', e.target.password.value);
    if (e.target.password.value !== e.target.confirmPassword.value) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/register', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const result = await res.json();
      setMessage(result.message || result.error);
      if (res.ok && result.message) {
        setTimeout(() => { window.location.hash = '#login'; }, 1500);
      }
    } catch (err) {
      setMessage('Network error.');
    }
  });

  return container;
}
