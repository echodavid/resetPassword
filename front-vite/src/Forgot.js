// forgot.html migrated to Vite as a component
// Vite uses import.meta.env for environment variables

export function Forgot() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Restablecer Contraseña</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>
    <form id="forgotForm">
      <input type="text" name="email" placeholder="Ingresa tu correo" required>
      <button type="submit" id="submitBtn">Enviar Código de Recuperación</button>
    </form>
    <p><a href="#login">Volver al Inicio</a></p>
  `;

  const messageEl = container.querySelector('#message');
  const setMessage = (text) => {
    messageEl.innerText = text;
    messageEl.style.fontWeight = 'bold';
  };

  container.querySelector('#forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#submitBtn');
    const form = e.target;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    setMessage('');

    try {
      const data = new URLSearchParams();
      data.append('email', form.email.value);
      const res = await fetch(import.meta.env.VITE_API_URL + '/forgot', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const result = await res.json();

      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Código de Recuperación';

      if (res.ok) {
        setMessage(result.message);
        setTimeout(() => { window.location.hash = '#reset'; }, 1500);
      } else {
        setMessage(result.error || 'Error al enviar el código.');
      }
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Código de Recuperación';
      setMessage('Error de red.');
    }
  });

  return container;
}

// Usage example:
// document.body.appendChild(Forgot());
