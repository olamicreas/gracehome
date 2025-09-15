// form-catcher.js
(function () {
  // === CONFIGURATION ===
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzLNAk6b7fva2qhygLg1oj5dzGMjLjYfXBzjH2nwk8lAMp6-8_GEE6KzjTVVGtu_1q/exec';
  const SECRET_TOKEN = 'change_this_to_a_secret_token'; // Must match your Apps Script token

  // === HELPER: submit form to Google Apps Script ===
  function submitToGAS(form) {
    const fd = new FormData(form);
    fd.set('_t', SECRET_TOKEN); // attach token
    fd.set('_page', location.href);

    return fetch(GAS_URL, {
      method: 'POST',
      body: fd,
      mode: 'cors',
      credentials: 'omit'
    })
      .then(res => res.json())
      .catch(err => { throw err; });
  }

  // === FORM SUBMIT HANDLER ===
  function handleSubmit(ev) {
    ev.preventDefault();
    let form = ev.target;
    if (form.tagName !== 'FORM') form = form.closest('form');
    if (!form) return;

    // Remove any existing inline submit handlers
    try { form.onsubmit = null; form.removeAttribute('onsubmit'); } catch (e) {}

    // Check honeypot field
    const hp = form.querySelector("input[name='input_7']");
    if (hp && hp.value) return; // likely bot

    submitToGAS(form)
      .then(data => {
        console.log('Form response:', data);

        // Display success message
        const msg = document.createElement('div');
        msg.className = 'form-catcher-success';
        msg.textContent = (data && data.status === 'ok')
          ? 'Thanks! Your message has been sent.'
          : 'There was an error. Please try again.';
        form.appendChild(msg);

        // Reset form
        form.reset();
      })
      .catch(err => {
        console.error('Form submit error:', err);
        const errMsg = document.createElement('div');
        errMsg.className = 'form-catcher-error';
        errMsg.textContent = 'Network error — message not sent.';
        form.appendChild(errMsg);
      });
  }

  // === ATTACH HANDLER TO ALL FORMS ===
  function attach() {
    document.addEventListener('submit', handleSubmit, true); // capture phase
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
