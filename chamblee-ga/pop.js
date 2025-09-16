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
/* NAVBAR (desktop) centered) */
.elementor-nav-menu--main { display:flex; justify-content:center; align-items:center; gap:1.25rem; background:transparent !important; width:100%; box-sizing:border-box; }
.elementor-nav-menu { list-style:none; margin:0; padding:0; display:flex; gap:1rem; align-items:center; }
.elementor-nav-menu li { position:relative; }

/* Desktop dropdown */
.elementor-nav-menu--dropdown {
  display:none;
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  top:calc(100% + 8px);
  min-width:220px;
  background: rgba(255,255,255,0.98);
  box-shadow:0 10px 30px rgba(0,0,0,0.12);
  border-radius:8px;
  padding:6px 8px;
  z-index:9999;
  text-align:left;
}
.elementor-nav-menu--dropdown a { display:block; padding:8px 12px; color:inherit; text-decoration:none; }
.elementor-nav-menu li:hover > .elementor-nav-menu--dropdown { display:block; }

/* MOBILE: overlay menu - white translucent thicker background and each nav item on its own row */
.elementor-menu-toggle { cursor:pointer; user-select:none; z-index:99998; }
.elementor-nav-menu--main.mobile-hidden { display:none !important; }

@media (max-width: 900px) {
  .elementor-nav-menu--main.mobile-visible {
    display:flex !important;
    flex-direction:column;
    gap:0;
    padding:18px;
    background: rgba(255,255,255,0.96) !important; /* white with small transparency (thicker feel) */
    color: #183a66 !important; /* dark/navy text */
    position:fixed;
    left:0;
    right:0;
    top:70px; /* tweak top if header height differs */
    margin:0 auto;
    box-shadow:0 12px 36px rgba(0,0,0,0.18);
    border-radius:10px;
    z-index:99997;
    width: calc(100% - 24px);
    max-width:960px;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }

  /* Make each nav link display on its own row in mobile overlay */
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu {
    flex-direction:column !important;
    gap:6px;
    padding: 6px 0;
    width:100%;
  }

  /* Each list item full width */
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu > li {
    width:100%;
    display:block;
  }

  /* Anchor as a centered row with arrow on the same line */
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu a,
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu .elementor-item,
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu .elementor-sub-item {
    display:flex !important;
    align-items:center !important;
    justify-content:center !important;
    gap:10px;
    padding:14px 12px !important;
    color:#183a66 !important;
    text-align:center !important;
    font-weight:700;
    letter-spacing:0.5px;
    width:100%;
    box-sizing:border-box;
  }

  /* Make the sub-arrow inline and inherit color */
  .elementor-nav-menu--main.mobile-visible .sub-arrow {
    display:inline-flex !important;
    align-items:center;
    justify-content:center;
    color: inherit !important;
    height:18px;
    width:18px;
    flex: 0 0 18px;
    margin-left:4px;
  }
  .elementor-nav-menu--main.mobile-visible .sub-arrow svg,
  .elementor-nav-menu--main.mobile-visible .sub-arrow * {
    fill: currentColor !important;
    stroke: none !important;
    height:100%;
    width:100%;
  }

  /* Mobile submenu (open inline) */
  .elementor-nav-menu li.open > .elementor-nav-menu--dropdown {
    display:block;
    position:relative;
    transform:none;
    left:auto;
    top:auto;
    box-shadow:none;
    background:transparent;
    padding:0;
    margin-top:6px;
  }

  /* Visually separate items with a subtle divider suitable for white bg */
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu > li + li {
    border-top: 1px solid rgba(0,0,0,0.06);
  }

  /* Submenu items style (when shown inline) */
  .elementor-nav-menu--main.mobile-visible .elementor-nav-menu--dropdown a {
    justify-content:center;
    padding:10px 14px;
    color: #183a66 !important;
    background: transparent;
  }
}
/* Desktop fallback: ensure dropdown background slightly thicker */
@media (min-width:901px) {
  .elementor-nav-menu--dropdown { background: rgba(255,255,255,0.99); }
}

/* Alerts */
#form-catcher-alert-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display:flex; flex-direction:column; gap:10px; pointer-events:none; }
.form-catcher-alert { pointer-events:auto; padding:14px 18px; border-radius:8px; color:#fff; font-weight:600; box-shadow:0 6px 20px rgba(0,0,0,0.12); max-width:360px; word-break:break-word; transform:translateX(120%); opacity:0; transition: transform .45s cubic-bezier(.2,.9,.2,1), opacity .45s; }
.form-catcher-alert.success { background: #1abc9c; }
.form-catcher-alert.error   { background: #e74c3c; }
.form-catcher-alert.warning { background: #f39c12; }

/* Fallback schedule modal */
#eg-fallback-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:1000000; padding:20px; }
#eg-fallback-modal .eg-card { background:#fff; border-radius:10px; padding:18px; width: 100%; max-width:720px; box-shadow:0 20px 60px rgba(0,0,0,0.28); }
#eg-fallback-modal .eg-card h2 { margin:0 0 8px; font-size:20px; }
#eg-fallback-modal .eg-row { display:flex; gap:8px; margin-bottom:8px; }
#eg-fallback-modal input, #eg-fallback-modal textarea, #eg-fallback-modal select { width:100%; padding:8px 10px; border:1px solid #ddd; border-radius:6px; font-size:14px; }
#eg-fallback-modal label { font-size:13px; margin-bottom:6px; display:block; color:#222; }
#eg-fallback-modal .eg-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
#eg-fallback-modal button { padding:10px 14px; border-radius:6px; border:0; cursor:pointer; font-weight:600; }
#eg-fallback-modal .eg-btn-primary { background:#1abc9c; color:#fff; }
#eg-fallback-modal .eg-btn-ghost { background:transparent; border:1px solid #ddd; color:#333; } /* cancel visible */
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

    if (!toggle || !mainNav) {
      // If not found, nothing to do
      return;
    }

    // Mobile initial state
    if (window.innerWidth <= 900) mainNav.classList.add('mobile-hidden');

    toggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      const showing = mainNav.classList.contains('mobile-visible');
      if (!showing) {
        mainNav.classList.remove('mobile-hidden');
        mainNav.classList.add('mobile-visible');
        // ensure navlinks stack
        // add ARIA
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        mainNav.classList.remove('mobile-visible');
        mainNav.classList.add('mobile-hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Mobile submenu toggles: click the parent anchor to open inline
    $$('.elementor-nav-menu li.menu-item-has-children').forEach(li => {
      const a = li.querySelector(':scope > a');
      if (!a) return;
      a.addEventListener('click', (ev) => {
        if (window.innerWidth <= 900) {
          ev.preventDefault();
          li.classList.toggle('open');
        }
      });
      // keep desktop hover working (CSS handles it)
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

  /* ===== Fallback schedule modal (elementor fallback) ===== */
  function openFallbackScheduleModal() {
    // remove existing if present
    const existing = document.getElementById('eg-fallback-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'eg-fallback-modal';
    modal.innerHTML = `
      <div class="eg-card" role="dialog" aria-modal="true" aria-label="Schedule Appointment — ${COMPANY_NAME}">
        <h2>Schedule Appointment — ${COMPANY_NAME}</h2>
        <p style="margin:0 0 10px;color:#444;font-size:14px">Fill the form below and we'll contact you to confirm.</p>

        <form id="eg-schedule-form" autocomplete="on" novalidate>
          <div class="eg-row">
            <div style="flex:1">
              <label for="eg-name">Full name</label>
              <input id="eg-name" name="input_1" type="text" required />
            </div>
            <div style="flex:1">
              <label for="eg-phone">Phone</label>
              <input id="eg-phone" name="input_3" type="tel" required />
            </div>
          </div>

          <div style="margin-bottom:8px;">
            <label for="eg-email">Email</label>
            <input id="eg-email" name="input_4" type="email" required />
          </div>

          <div class="eg-row">
            <div style="flex:1">
              <label for="eg-date">Preferred date</label>
              <input id="eg-date" name="input_date" type="date" />
            </div>
            <div style="flex:1">
              <label for="eg-time">Preferred time</label>
              <input id="eg-time" name="input_time" type="time" />
            </div>
          </div>

          <div style="margin-bottom:8px;">
            <label for="eg-service">Service / Notes</label>
            <select id="eg-service" name="input_5">
              <option value="">Select service (optional)</option>
              <option>Companionship Care</option>
              <option>Personal Assistance</option>
              <option>Transportation Services</option>
              <option>General Inquiry</option>
            </select>
          </div>

          <div style="margin-bottom:8px;">
            <label for="eg-msg">Message</label>
            <textarea id="eg-msg" name="input_6" rows="4"></textarea>
          </div>

          <div style="display:none;"><input name="input_7" value="" /></div>

          <div class="eg-actions">
            <button type="button" class="eg-btn-ghost" id="eg-cancel">Cancel</button>
            <button type="submit" class="eg-btn-primary">Request Appointment</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // cancel/remove
    const cancel = document.getElementById('eg-cancel');
    if (cancel) cancel.addEventListener('click', () => modal.remove());

    // also close if click outside the card
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) modal.remove();
    });

    // submit handler — sends to GAS as appointment-specific with subject hint
    const form = document.getElementById('eg-schedule-form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const hp = form.querySelector("input[name='input_7']");
      if (hp && hp.value) {
        showAlert('Spam detected. Submission ignored.', 'warning');
        return;
      }
      const fd = new FormData(form);
      fd.set('_t', SECRET_TOKEN);
      fd.set('_page', location.href);
      fd.set('appointment_request', '1');
      fd.set('subject_hint', 'Booking Appointment Request');

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';

      fetch(GAS_URL, { method: 'POST', body: fd, mode: 'cors', credentials: 'omit' })
        .then(res => res.json().catch(()=>({status:'error',message:'Invalid response'})))
        .then(json => {
          if (json && json.status === 'ok') {
            showAlert('Appointment request sent — we will contact you shortly.', 'success');
            form.reset();
            setTimeout(()=>modal.remove(), 900);
          } else if (json && json.status === 'spam') {
            showAlert(json.message || 'Spam detected.', 'warning');
          } else {
            showAlert((json && json.message) ? json.message : 'Error sending request. Try again later.', 'error');
          }
        })
        .catch(err => {
          console.error('Schedule submit error', err);
          showAlert('Network error — appointment not sent.', 'error');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        });
    });
  }

  /* ===== Popup trigger initialization (tries Elementor, falls back) ===== */
  function initPopupTriggers() {
    document.addEventListener('click', function (ev) {
      const a = ev.target.closest('a[href*="popup:open"], a[href*="elementor-action"], a[href*="popup%3Aopen"]');
      if (!a) return;
      ev.preventDefault();

      // Try to parse ID from href or data-settings JSON
      const href = a.getAttribute('href') || '';
      let id = null;
      const m = href.match(/id(?:%3D|=)(\d+)/);
      if (m && m[1]) id = parseInt(m[1]);

      if (!id) {
        const parent = a.closest('[data-settings]');
        if (parent) {
          try {
            const ds = parent.getAttribute('data-settings');
            if (ds) {
              const j = JSON.parse(ds);
              if (j && j.id) id = parseInt(j.id);
              if (!id && j && j.popup && j.popup.id) id = parseInt(j.popup.id);
            }
          } catch (e){}
        }
      }

      // If elementor popup api present, call it
      if (id) {
        try {
          if (window.elementorPro && elementorPro.modules && elementorPro.modules.popup && typeof elementorPro.modules.popup.showPopup === 'function') {
            elementorPro.modules.popup.showPopup({ id: id });
            return;
          }
          if (window.elementor && elementor.modules && elementor.modules.popup && typeof elementor.modules.popup.showPopup === 'function') {
            elementor.modules.popup.showPopup({ id: id });
            return;
          }
        } catch (err) {
          console.warn('Elementor popup API error', err);
        }
      }

      // fallback modal
      openFallbackScheduleModal();
    }, true);
  }

  /* ===== Init all ===== */
  function initAll() {
    try { initMenuHandlers(); } catch (e) { console.warn('menu init error', e); }
    try { initPopupTriggers(); } catch (e) { console.warn('popup init error', e); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();

})();