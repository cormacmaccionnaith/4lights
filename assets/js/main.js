/* The Four Lights — light-touch progressive enhancement.
   Everything here is optional polish; the site is fully readable without JS. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---- current year ---- */
  var y = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = y;
  });

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length && "IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---- contact form: inline validation + graceful mailto ---- */
  var form = document.querySelector(".cform");
  if (form) {
    var status = form.querySelector("[data-form-status]");

    var showError = function (field, msg) {
      var slot = form.querySelector('[data-err-for="' + field.id + '"]');
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (slot) slot.textContent = msg || "";
      return !msg;
    };

    var validEmail = function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    };

    var validate = function () {
      var ok = true;
      var name = form.querySelector("#cf-name");
      var email = form.querySelector("#cf-email");
      var message = form.querySelector("#cf-message");
      ok = showError(name, name.value.trim() ? "" : "Please add your name.") && ok;
      ok =
        showError(
          email,
          !email.value.trim()
            ? "Please add your email."
            : validEmail(email.value.trim())
            ? ""
            : "That email doesn't look right."
        ) && ok;
      ok = showError(message, message.value.trim() ? "" : "Please add a short message.") && ok;
      return ok;
    };

    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.getAttribute("aria-invalid") === "true") validate();
      });
    });

    form.addEventListener("submit", function (e) {
      if (!validate()) {
        e.preventDefault();
        if (status) status.textContent = "Please check the highlighted fields.";
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      // Let the mailto action proceed; give the user feedback either way.
      if (status)
        status.textContent = "Opening your email app… if nothing happens, write to us directly.";
    });
  }
})();
