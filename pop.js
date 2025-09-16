/* nav-popup-schedule.js
   Single-file: navbar centering (desktop), mobile full-width overlay, services dropdown,
   Quick Inquiry → Schedule Appointment popup (Elementor-aware with fallback), and Apps Script submit.
*/
(function () {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbz86pfhVrwTWACeQldhivBGIKp8aNdWRW6p0Xt0Pne-9i-ePsJ7LImJo_lr0afOuIzDjA/exec';
  const SECRET_TOKEN = 'change_this_to_a_secret_token';
  const COMPANY_NAME = 'HIS GRACE HOME CARE, LLC';

  /* ===== Inject CSS ===== */
  const css = `
/* ... all your existing CSS ... */
#form-catcher-alert-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display:flex; flex-direction:column; gap:10px; pointer-events:none; }
.form-catcher-alert { pointer-events:auto; padding:14px 18px; border-radius:8px; color:#fff; font-weight:600; box-shadow:0 6px 20px rgba(0,0,0,0.12); max-width:360px; word-break:break-word; transform:translateX(120%); opacity:0; transition: transform .45s cubic-bezier(.2,.9,.2,1), opacity .45s; }
.form-catcher-alert.success { background: #1abc9c; }
.form-catcher-alert.error   { background: #e74c3c; }
.form-catcher-alert.warning { background: #f39c12; }
#eg-fallback-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:1000000; padding:20px; }
#eg-fallback-modal .eg-card { background:#fff; border-radius:10px; padding:18px; width: 100%; max-width:720px; box-shadow:0 20px 60px rgba(0,0,0,0.28); }
/* ... rest of modal & form styles ... */
`;
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  /* ===== Utilities ===== */
  function $ (sel, root = document) { return root.querySelector(sel); }
  function $$ (sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function showAlert(message, type = 'success') {
    let container = document.getElementById('form-catcher-alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'form-catcher-alert-container';
      document.body.appendChild(container);
    }
    const box = document.createElement('div');
    box.className = 'form-catcher-alert ' + (type || 'success');
    box.textContent = message;
    container.appendChild(box);
    requestAnimationFrame(() => {
      box.style.transform = 'translateX(0)';
      box.style.opacity = '1';
    });
    setTimeout(() => {
      box.style.transform = 'translateX(120%)';
      box.style.opacity = '0';
      setTimeout(() => box.remove(), 520);
    }, 3800);
  }

  /* ===== Navbar handlers ===== */
  function initMenuHandlers() {
    const toggle = document.querySelector('.elementor-menu-toggle');
    const mainNav = document.querySelector('nav.elementor-nav-menu--main') || document.querySelector('.elementor-nav-menu--main');
    if (!toggle || !mainNav) return;

    if (window.innerWidth <= 900) mainNav.classList.add('mobile-hidden');

    toggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      const showing = mainNav.classList.contains('mobile-visible');
      if (!showing) {
        mainNav.classList.remove('mobile-hidden');
        mainNav.classList.add('mobile-visible');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        mainNav.classList.remove('mobile-visible');
        mainNav.classList.add('mobile-hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    $$('.elementor-nav-menu li.menu-item-has-children').forEach(li => {
      const a = li.querySelector(':scope > a');
      if (!a) return;
      a.addEventListener('click', (ev) => {
        if (window.innerWidth <= 900) {
          ev.preventDefault();
          li.classList.toggle('open');
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        mainNav.classList.remove('mobile-hidden','mobile-visible');
        $$('.elementor-nav-menu li.open').forEach(n => n.classList.remove('open'));
      } else {
        if (!mainNav.classList.contains('mobile-hidden') && !mainNav.classList.contains('mobile-visible')) {
          mainNav.classList.add('mobile-hidden');
        }
      }
    });
  }

  /* ===== Fallback schedule modal ===== */
  function openFallbackScheduleModal() {
    const existing = document.getElementById('eg-fallback-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'eg-fallback-modal';
    modal.innerHTML = `
      <div class="eg-card" role="dialog" aria-modal="true" aria-label="Schedule Appointment — ${COMPANY_NAME}">
        <h2>Schedule Appointment — ${COMPANY_NAME}</h2>
        <p style="margin:0 0 10px;color:#444;font-size:14px">Fill the form below and we'll contact you to confirm.</p>
        <form id="eg-schedule-form" autocomplete="on" novalidate>
          <!-- form fields here ... -->
          <div style="display:none;"><input name="input_7" value="" /></div>
          <div class="eg-actions">
            <button type="button" class="eg-btn-ghost" id="eg-cancel">Cancel</button>
            <button type="submit" class="eg-btn-primary">Request Appointment</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#eg-cancel')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', ev => { if (ev.target === modal) modal.remove(); });

    const form = document.getElementById('eg-schedule-form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const hp = form.querySelector("input[name='input_7']");
      if (hp && hp.value) { showAlert('Spam detected. Submission ignored.', 'warning'); return; }
      const fd = new FormData(form);
      fd.set('_t', SECRET_TOKEN);
      fd.set('_page', location.href);
      fd.set('appointment_request', '1');
      fd.set('subject_hint', 'Booking Appointment Request');

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';

      fetch(GAS_URL, { method:'POST', body:fd, mode:'cors', credentials:'omit' })
        .then(res => res.json().catch(()=>({status:'error',message:'Invalid response'})))
        .then(json => {
          if (json?.status === 'ok') { showAlert('Appointment request sent — we will contact you shortly.','success'); form.reset(); setTimeout(()=>modal.remove(),900); }
          else if (json?.status === 'spam') { showAlert(json.message || 'Spam detected.','warning'); }
          else { showAlert(json?.message || 'Error sending request. Try again later.','error'); }
        })
        .catch(err => { console.error('Schedule submit error', err); showAlert('Network error — appointment not sent.','error'); })
        .finally(()=>{ submitBtn.disabled=false; submitBtn.textContent=origText; });
    });
  }

  /* ===== Popup triggers ===== */
  function initPopupTriggers() {
    document.addEventListener('click', function (ev) {
      const a = ev.target.closest('a[href*="popup:open"], a[href*="elementor-action"], a[href*="popup%3Aopen"]');
      if (!a) return;
      ev.preventDefault();

      // Try Elementor API
      let id = null;
      const href = a.getAttribute('href') || '';
      const m = href.match(/id(?:%3D|=)(\d+)/);
      if (m && m[1]) id = parseInt(m[1]);
      if (!id) {
        const parent = a.closest('[data-settings]');
        if (parent) {
          try { const j = JSON.parse(parent.getAttribute('data-settings') || '{}'); if (j && j.id) id = parseInt(j.id); } catch(e){}
        }
      }

      if (id && window.elementorPro?.modules?.popup?.showPopup) { elementorPro.modules.popup.showPopup({id}); return; }
      if (id && window.elementor?.modules?.popup?.showPopup) { elementor.modules.popup.showPopup({id}); return; }

      openFallbackScheduleModal();
    }, true);
  }

  /* ===== Initialize all ===== */
  function initAll() {
    try { initMenuHandlers(); } catch(e){console.warn('menu init error', e);}
    try { initPopupTriggers(); } catch(e){console.warn('popup init error', e);}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

})();
