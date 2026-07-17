/* ============================================================
   MADRAS MASSEUR — site behaviour (vanilla JS, no dependencies)
   ============================================================ */

/* ---------- Configurable contact constants ----------
   Edit these to update contact details across the whole site. */
const CONFIG = {
  WHATSAPP_NUMBER: "919962956210",          // international format, no "+" or spaces
  PHONE_NUMBER: "+919962956210",
  EMAIL: "contact@madrasmasseur.com",
  ADDRESS: "Chennai, Tamil Nadu, India",
  BUSINESS_NAME: "Madras Masseur",
};

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Current year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  const header = $("#siteHeader");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $("#navToggle");
  const menu = $("#mobileMenu");
  const body = document.body;

  const openMenu = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    body.classList.add("no-scroll");
    // focus first link for keyboard users
    const firstLink = $(".nav-link", menu);
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    body.classList.remove("no-scroll");
  };

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    // Close on link click
    $$(".nav-link", menu).forEach((link) =>
      link.addEventListener("click", closeMenu)
    );
    // Close CTA button in menu too
    $$("a.btn", menu).forEach((a) => a.addEventListener("click", closeMenu));

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close if resized up to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900 && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      // update hash without a jump
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Reveal-on-scroll (IntersectionObserver) ---------- */
  const revealEls = $$(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Active nav link on scroll (scroll-spy) ---------- */
  const sections = ["specialist", "services", "experience", "qualifications", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$(".nav-desktop .nav-link");

  const setActive = (id) => {
    navLinks.forEach((l) => {
      const match = l.getAttribute("href") === "#" + id;
      l.classList.toggle("is-active", match);
    });
  };

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  const onScrollTop = () => {
    if (!toTop) return;
    toTop.classList.toggle("is-visible", window.scrollY > 600);
  };
  onScrollTop();
  window.addEventListener("scroll", onScrollTop, { passive: true });
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- WhatsApp CTA link ---------- */
  const waCta = $("#ctaWhatsApp");
  if (waCta) {
    const msg = encodeURIComponent(
      `Hi ${CONFIG.BUSINESS_NAME}, I'd like to book a sports massage session.`
    );
    waCta.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;
  }

  /* ---------- Contact form: validation + WhatsApp enquiry ---------- */
  const form = $("#enquiryForm");
  const status = $("#formStatus");

  const showError = (field, on) => {
    field.closest(".field").classList.toggle("has-error", on);
  };

  const validators = {
    fullName: (v) => v.trim().length >= 2,
    phone: (v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    },
    service: (v) => v.trim() !== "",
  };

  if (form) {
    // Clear error as the user corrects a field
    ["fullName", "phone", "service"].forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      const evt = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(evt, () => {
        if (validators[name](el.value)) showError(el, false);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      let firstInvalid = null;

      ["fullName", "phone", "service"].forEach((name) => {
        const el = form.elements[name];
        const ok = validators[name](el.value);
        showError(el, !ok);
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = el;
        }
      });

      if (!valid) {
        if (status) {
          status.textContent = "Please complete the required fields highlighted above.";
          status.classList.add("is-visible");
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Build WhatsApp enquiry message
      const data = {
        name: form.elements.fullName.value.trim(),
        phone: form.elements.phone.value.trim(),
        service: form.elements.service.value,
        date: form.elements.date.value,
        message: form.elements.message.value.trim(),
      };

      let text = `*New Sports Massage Enquiry*%0A%0A`;
      text += `*Name:* ${data.name}%0A`;
      text += `*Phone:* ${data.phone}%0A`;
      text += `*Service:* ${data.service}%0A`;
      if (data.date) text += `*Preferred Date:* ${data.date}%0A`;
      if (data.message) text += `*Message:* ${data.message}%0A`;

      const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${text}`;

      if (status) {
        status.textContent = "Thank you! Opening WhatsApp with your enquiry…";
        status.classList.add("is-visible");
      }

      window.open(url, "_blank", "noopener");
      form.reset();
    });
  }
})();
