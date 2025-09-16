(function () {
  const GAS_URL = "https://script.google.com/macros/s/AKfycbz86pfhVrwTWACeQldhivBGIKp8aNdWRW6p0Xt0Pne-9i-ePsJ7LImJo_lr0afOuIzDjA/exec";
  const SECRET_TOKEN = "change_this_to_a_secret_token";

  function showAlert(message, type="success") {
    const alert = document.createElement("div");
    alert.className = "form-catcher-alert " + type;
    alert.textContent = message;
    Object.assign(alert.style, {
      position: "fixed",
      top: "20px",
      right: "-400px",
      padding: "15px 25px",
      background: type === "success" ? "#2ECC71" : "#E74C3C",
      color: "white",
      fontWeight: "bold",
      borderRadius: "5px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 9999,
      transition: "right 0.5s ease, opacity 0.5s ease",
      opacity: 0
    });
    document.body.appendChild(alert);
    setTimeout(() => { alert.style.right = "20px"; alert.style.opacity = 1; }, 50);
    setTimeout(() => { alert.style.right = "-400px"; alert.style.opacity = 0; setTimeout(() => alert.remove(), 600); }, 4000);
  }

  function submitForm(form) {
    const fd = new FormData(form);
    fd.set("_t", SECRET_TOKEN);
    fd.set("_page", location.href);
    return fetch(GAS_URL, { method: "POST", body: fd, mode: "cors", credentials: "omit" })
      .then(res => res.json())
      .catch(err => { console.error("Form submission error:", err); return { status: "error", message: "Network error" }; });
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    let form = ev.target;
    if (form.tagName !== "FORM") form = form.closest("form");
    if (!form) return;
    if (form.id === "eg-schedule-form") return;
    try { form.onsubmit = null; form.removeAttribute("onsubmit"); } catch(e)./wp-content/plugins/elementor/assets/js/form-catcher.js

    const hp = form.querySelector("input[name=input_7]");
    if (hp && hp.value) return;

    submitForm(form).then(data => {
      console.log("Form result:", data);
      if (data.status === "ok") { form.reset(); showAlert(data.message || "Message sent successfully!", "success"); }
      else if (data.status === "spam") { showAlert(data.message || "Spam detected. Submission ignored.", "warning"); }
      else { showAlert(data.message || "Error sending message. Please try again.", "error"); }
    });
  }

  document.addEventListener("click", function(ev){
    const btn = ev.target.closest("input[type=submit], button[type=submit]");
    if (!btn) return;
    if (btn.closest("#eg-schedule-form")) return;
    ev.preventDefault();
    if (btn.form) handleSubmit({ target: btn.form, preventDefault: ()=>./wp-content/plugins/elementor/assets/js/form-catcher.js });
  }, true);

  function attach() { document.addEventListener("submit", handleSubmit, true); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
  else attach();
})();
