// form-catcher.js
(function () {
  // Replace with your deployed Apps Script URL
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzLNAk6b7fva2qhygLg1oj5dzGMjLjYfXBzjH2nwk8lAMp6-8_GEE6KzjTVVGtu_1q/exec';
  const SECRET_TOKEN = 'change_this_to_a_secret_token'; // must match token in Apps Script

  // Function to submit form via fetch
  function submitForm(form) {
    const fd = new FormData(form);
    fd.set('_t', SECRET_TOKEN);
    fd.set('_page', location.href);

    return fetch(GAS_URL, {
      method: 'POST',
      body: fd,
      mode: 'cors',
      credentials: 'omit'
    })
    .then(res => res.json())
    .catch(err => {
      console.error('Form submission error:', err);
      return { status: 'error', message: 'Network error' };
    });
  }

  // Function to handle form submit events
  function handleSubmit(ev) {
    ev.preventDefault();

    let form = ev.target;
    if (form.tagName !== 'FORM') form = form.closest('form');
    if (!form) return;

    // Remove inline handlers to prevent conflicts
    try { form.onsubmit = null; form.removeAttribute('onsubmit'); } catch(e){}

    // Honeypot check (bots)
    const hp = form.querySelector("input[name='input_7']");
    if (hp && hp.value) return;

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

  // Attach intercepts to forms and submit buttons
  function attach() {
    // Intercept native form submit
    document.addEventListener('submit', handleSubmit, true);

    // Intercept submit button clicks
    document.addEventListener('click', function(ev){
      const btn = ev.target.closest('input[type="submit"], button[type="submit"]');
      if (!btn) return;
      ev.preventDefault();
      const form = btn.form;
      if (form) handleSubmit({ target: form, preventDefault: ()=>{} });
    }, true);

    // Remove method attributes to prevent native POST
    document.querySelectorAll('form').forEach(f => f.removeAttribute('method'));
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();