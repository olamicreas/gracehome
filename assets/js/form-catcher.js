// form-catcher.js
(function () {
  // === CONFIG ===
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzLNAk6b7fva2qhygLg1oj5dzGMjLjYfXBzjH2nwk8lAMp6-8_GEE6KzjTVVGtu_1q/exec';
  const SECRET_TOKEN = 'change_this_to_a_secret_token'; // must match Apps Script token

  // === Submit form to GAS ===
  async function submitToGAS(form) {
    const fd = new FormData(form);
    fd.set('_t', SECRET_TOKEN);
    fd.set('_page', location.href);

    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: fd,
      mode: 'cors',
      credentials: 'omit'
    });

    return response.json(); // assumes Apps Script returns JSON
  }

  // === Handle form submit ===
  async function handler(ev) {
    ev.preventDefault();
    ev.stopImmediatePropagation(); // prevent other listeners

    let form = ev.target;
    if (form.tagName !== 'FORM') form = form.closest('form');
    if (!form) return;

    // Honeypot check
    const honeypot = form.querySelector("input[name='input_7']");
    if (honeypot && honeypot.value) return; // likely bot

    // Remove existing inline onsubmit (if any)
    try { form.onsubmit = null; form.removeAttribute('onsubmit'); } catch(e){}

    // Clear previous messages
    const oldMsg = form.querySelector('.form-catcher-success, .form-catcher-error');
    if (oldMsg) oldMsg.remove();

    // Show temporary "sending..." message
    const sendingMsg = document.createElement('div');
    sendingMsg.className = 'form-catcher-sending';
    sendingMsg.textContent = 'Sending message…';
    form.appendChild(sendingMsg);

    try {
      const data = await submitToGAS(form);
      sendingMsg.remove();

      const msg = document.createElement('div');
      msg.className = data && data.status === 'ok' ? 'form-catcher-success' : 'form-catcher-error';
      msg.textContent = data && data.status === 'ok'
        ? 'Thanks — your message has been sent.'
        : (data && data.status === 'forbidden' ? 'Submission forbidden' : 'There was an error. Please try again.');

      form.appendChild(msg);

      if (data && data.status === 'ok') form.reset();
    } catch (err) {
      sendingMsg.remove();
      console.error('Form submission error:', err);
      const errMsg = document.createElement('div');
      errMsg.className = 'form-catcher-error';
      errMsg.textContent = 'Network error — message not sent.';
      form.appendChild(errMsg);
    }
  }

  // === Attach handler to all forms ===
  function attach() {
    document.addEventListener('submit', handler, true); // capture phase
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();