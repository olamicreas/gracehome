document.addEventListener("DOMContentLoaded", function() {
  const menuToggle = document.querySelector(".elementor-menu-toggle");
  const mainNav = document.querySelector("nav.elementor-nav-menu--main");

  // Mobile burger toggle
  if(menuToggle && mainNav) {
    menuToggle.addEventListener("click", function() {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !expanded);
      mainNav.classList.toggle("active"); // add class to show/hide
    });
  }

  // Click on parent items to toggle dropdown (for mobile)
  document.querySelectorAll(".menu-item-has-children > a").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault(); // prevent page jump
      link.parentElement.classList.toggle("open"); // toggle open class
    });
  });
});
