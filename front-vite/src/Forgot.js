// forgot.html migrated to Vite as a component
// Vite uses import.meta.env for environment variables

export function Forgot() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Reset Password</h1>
    <div id="message" class="message" style="margin-bottom: 16px;"></div>
    <form id="forgotForm">
      <input type="text" name="email" placeholder="Enter your email" required>
      <button type="submit" id="submitBtn">Send Recovery Code</button>
    </form>
    <p><a href="#login">Back to Login</a></p>
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
    submitBtn.textContent = 'Sending...';
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
      submitBtn.textContent = 'Send Recovery Code';

      if (res.ok) {
        setMessage(result.message);
        setTimeout(() => { window.location.hash = '#reset'; }, 1500);
      } else {
        setMessage(result.error || 'Error sending code.');
      }
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Recovery Code';
      setMessage('Network error.');
    }
  });

  return container;
}

// Usage example:
// document.body.appendChild(Forgot());
