// forgot.html migrated to Vite as a component
// Vite uses import.meta.env for environment variables

export function Forgot() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Reset Password</h1>
    <form id="forgotForm">
      <input type="text" name="email" placeholder="Enter your email" required>
      <button type="submit" id="submitBtn">Send Reset Link</button>
    </form>
    <div id="message" class="message"></div>
    <div id="loading" class="loading" style="display: none;">Sending email...</div>
  `;

  container.querySelector('#forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = container.querySelector('#submitBtn');
    const messageDiv = container.querySelector('#message');
    const loadingDiv = container.querySelector('#loading');
    const form = container.querySelector('#forgotForm');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    loadingDiv.style.display = 'block';
    messageDiv.innerText = '';

    try {
      const data = new URLSearchParams();
      data.append('email', e.target.email.value);
      const res = await fetch(import.meta.env.VITE_API_URL + '/forgot', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const result = await res.json();

      loadingDiv.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';

      if (result.error) {
        messageDiv.innerText = `Error: ${result.error}`;
        messageDiv.style.color = 'red';
      } else {
        messageDiv.innerText = result.message;
        messageDiv.style.color = 'green';
        form.style.display = 'none';
      }
    } catch (error) {
      loadingDiv.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';

      messageDiv.innerText = 'Network error. Please try again.';
      messageDiv.style.color = 'red';
      console.error('Fetch error:', error);
    }
  });

  return container;
}

// Usage example:
// document.body.appendChild(Forgot());
