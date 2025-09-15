// form-catcher.js
(function () {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzLNAk6b7fva2qhygLg1oj5dzGMjLjYfXBzjH2nwk8lAMp6-8_GEE6KzjTVVGtu_1q/exec';
  const SECRET_TOKEN = 'change_this_to_a_secret_token';

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
    .catch(err => ({status:'error', message:'Network error'}));
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    let form = ev.target.tagName === 'FORM' ? ev.target : ev.target.closest('form');
    if (!form) return;

    try { form.onsubmit = null; form.removeAttribute('onsubmit'); } catch(e){}

    // Honeypot
    const hp = form.querySelector("input[name='input_7']");
    if (hp && hp.value) return;

    submitForm(form).then(data => {
      console.log('Form result:', data);

      let msg = form.querySelector('.form-catcher-message');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'form-catcher-message';
        msg.style.marginTop = '10px';
        form.appendChild(msg);
      }

      if (data.status === 'ok') {
        msg.textContent = data.message || 'Message sent successfully';
        msg.style.color = 'green';
        form.reset();
      } else if (data.status === 'spam') {
        msg.textContent = data.message || 'Spam detected. Submission ignored';
        msg.style.color = 'orange';
      } else {
        msg.textContent = data.message || 'Error sending message. Please try again.';
        msg.style.color = 'red';
      }
    });
  }

  function attach() {
    document.addEventListener('submit', handleSubmit, true);
    document.addEventListener('click', function(ev){
      const btn = ev.target.closest('input[type="submit"], button[type="submit"]');
      if (!btn) return;
      ev.preventDefault();
      if (btn.form) handleSubmit({ target: btn.form, preventDefault: ()=>{} });
    }, true);

    // Remove native method to avoid 405
    document.querySelectorAll('form').forEach(f => f.removeAttribute('method'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();