// form-catcher.js — ready to use
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

    // If the response is not JSON, this will throw — handled by caller
    return response.json();
  }

  // === Handle form submit ===
  async function handler(ev) {
    try {
      ev.preventDefault();
      ev.stopImmediatePropagation(); // prevent other listeners

      let form = ev.target;
      if (form.tagName !== 'FORM') form = form.closest('form');
      if (!form) return;

      // Honeypot check (input_7)
      const honeypot = form.querySelector("input[name='input_7']");
      if (honeypot && honeypot.value) return; // likely bot

      // Remove inline onsubmit if present
      try { form.onsubmit = null; form.removeAttribute('onsubmit'); } catch(e) {}

      // clear old messages
      const old = form.querySelector('.form-catcher-success, .form-catcher-error, .form-catcher-sending');
      if (old) old.remove();

      // sending indicator
      const sending = document.createElement('div');
      sending.className = 'form-catcher-sending';
      sending.textContent = 'Sending message…';
      form.appendChild(sending);

      const data = await submitToGAS(form);
      sending.remove();

      const msg = document.createElement('div');
      if (data && data.status === 'ok') {
        msg.className = 'form-catcher-success';
        msg.textContent = 'Thanks — your message has been sent.';
        form.reset();
      } else if (data && data.status === 'forbidden') {
        msg.className = 'form-catcher-error';
        msg.textContent = 'Submission forbidden.';
      } else {
        msg.className = 'form-catcher-error';
        msg.textContent = (data && data.message) ? 'Error: ' + data.message : 'There was an error. Please try again.';
      }
      form.appendChild(msg);

    } catch (err) {
      console.error('form-catcher error', err);
      try { ev.target && ev.target.querySelector('.form-catcher-sending') && ev.target.querySelector('.form-catcher-sending').remove(); } catch(e){}
      const errMsg = document.createElement('div');
      errMsg.className = 'form-catcher-error';
      errMsg.textContent = 'Network error — message not sent.';
      (ev.target && ev.target.appendChild) && ev.target.appendChild(errMsg);
    }
  }

  // === Attach handler to all forms (capture phase) ===
  function attach() {
    document.addEventListener('submit', handler, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
