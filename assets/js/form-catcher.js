// form-catcher.js
(function () {
  // Replace with your deployed Apps Script URL
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzLNAk6b7fva2qhygLg1oj5dzGMjLjYfXBzjH2nwk8lAMp6-8_GEE6KzjTVVGtu_1q/exec';

  function submitForm(form) {
    const fd = new FormData(form);

    // Optional: attach extra token for spam protection
    fd.set('_t', 'change_this_to_a_secret_token');

    return fetch(GAS_URL, {
      method: 'POST',
      body: fd,
      mode: 'cors',       // required for cross-origin
      credentials: 'omit' // no cookies
    })
    .then(res => res.json())
    .catch(err => {
      console.error('Form submission error:', err);
      return { status: 'error', message: 'Network error' };
    });
  }

  function handleSubmit(ev) {
    ev.preventDefault(); // prevent default page reload

    let form = ev.target;
    if (form.tagName !== 'FORM') form = form.closest('form');
    if (!form) return;

    // Optional: remove inline submit handlers
    try { form.onsubmit = null; form.removeAttribute('onsubmit'); } catch(e){}

    // Honeypot check (bots)
    const hp = form.querySelector("input[name='input_7']");
    if (hp && hp.value) return;

    // Submit via fetch
    submitForm(form).then(data => {
      console.log('Form result:', data);

      // Show success/failure message
      let msg = form.querySelector('.form-catcher-message');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'form-catcher-message';
        form.appendChild(msg);
      }

      if (data.status === 'ok') {
        msg.textContent = 'Thanks! Your message has been sent.';
        msg.style.color = 'green';
        form.reset();
      } else if (data.status === 'spam') {
        msg.textContent = 'Spam detected. Submission ignored.';
        msg.style.color = 'orange';
      } else {
        msg.textContent = 'Error sending message. Please try again.';
        msg.style.color = 'red';
      }
    });
  }

  function attach() {
    document.addEventListener('submit', handleSubmit, true); // capture phase ensures interception
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
