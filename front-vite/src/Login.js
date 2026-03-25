// Login page migrated to Vite
export function Login() {
  const container = document.createElement('div');
  container.className = 'container';

  const sessionToken = localStorage.getItem('sessionToken');
  if (sessionToken) {
    window.location.hash = '#account';
    return container;
  }

  container.innerHTML = `
    <h1>Iniciar Sesión</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>
    <form id="loginForm">
      <input type="text" name="email" placeholder="Correo electrónico" required>
      <div class="password-container">
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="button" class="toggle-password">Ver</button>
      </div>
      <button type="submit">Entrar</button>
    </form>
    <p><a href="#forgot">¿Olvidaste tu contraseña?</a></p>
    <p><a href="#verify?purpose=unlock-account">Desbloquear cuenta</a></p>
    <p><a href="#register">¿No tienes cuenta? Registrate</a></p>
  `;

  const messageEl = container.querySelector('#message');
  const setMessage = (text) => {
    messageEl.innerText = text;
    messageEl.style.fontWeight = 'bold';
  };

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

  container.querySelector('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new URLSearchParams();
    data.append('email', e.target.email.value);
    data.append('password', e.target.password.value);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/login', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const result = await res.json();
      if (res.ok && result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
        localStorage.setItem('userEmail', e.target.email.value.trim());
        setMessage(result.message || 'Inicio de sesión exitoso.');
        setTimeout(() => { window.location.hash = '#account'; }, 1000);
      } else {
        setMessage(result.error || 'Error al iniciar sesión.');
      }
    } catch (err) {
      setMessage('Error de red.');
    }
  });

  return container;
}
