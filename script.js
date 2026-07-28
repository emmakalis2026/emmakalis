
(() => {
  "use strict";

  const GA_ID = "G-8NGG7MXVF5";
  const CONSENT_KEY = "emma_analytics_consent";
  let analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(script);
  }

  function track(eventName, parameters = {}) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, parameters);
    }
  }

  const cookieBanner = document.querySelector("#cookie-banner");

  function showCookieBanner() {
    if (cookieBanner) cookieBanner.hidden = false;
  }

  function hideCookieBanner() {
    if (cookieBanner) cookieBanner.hidden = true;
  }

  const storedConsent = localStorage.getItem(CONSENT_KEY);
  if (storedConsent === "analytics") {
    loadAnalytics();
  } else if (storedConsent !== "necessary") {
    showCookieBanner();
  }

  document.querySelectorAll("[data-cookie]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.cookie;
      localStorage.setItem(CONSENT_KEY, value);
      if (value === "analytics") loadAnalytics();
      hideCookieBanner();
    });
  });

  document.querySelector("#cookie-settings")?.addEventListener("click", () => {
    localStorage.removeItem(CONSENT_KEY);
    showCookieBanner();
  });

  // Nawigacja mobilna
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  menuButton?.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    if (mobileMenu) mobileMenu.hidden = expanded;
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.hidden = true;
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  // Zamknięcie list zakupowych po kliknięciu poza nimi
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".purchase-dropdown[open]").forEach((details) => {
      if (!details.contains(event.target)) details.removeAttribute("open");
    });
  });

  document.querySelectorAll(".purchase-dropdown").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (details.open) track("purchase_menu_open");
    });
  });

  // Śledzenie sklepów i social mediów
  document.querySelectorAll("[data-store]").forEach((link) => {
    link.addEventListener("click", () => {
      track("click_store", {
        store_name: link.dataset.store,
        link_url: link.href
      });
    });
  });

  document.querySelectorAll("[data-track]").forEach((link) => {
    link.addEventListener("click", () => {
      track("social_click", {
        platform: link.dataset.track,
        link_url: link.href
      });
    });
  });

  document.querySelectorAll("[data-action='prolog-scroll']").forEach((link) => {
    link.addEventListener("click", () => track("prolog_navigation_click"));
  });

  document.querySelector("#full-prolog")?.addEventListener("toggle", (event) => {
    if (event.currentTarget.open) track("prolog_full_open");
  });

  // Filmy
  document.querySelectorAll("video[data-video-name]").forEach((video) => {
    let started = false;
    video.addEventListener("play", () => {
      if (!started) {
        started = true;
        track("video_start", { video_name: video.dataset.videoName });
      }
    });
    video.addEventListener("ended", () => {
      track("video_complete", { video_name: video.dataset.videoName });
    });
  });

  // Zakładki opinii
  const tabs = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      panels.forEach((panel) => panel.hidden = true);

      tab.classList.add("active");
      const target = document.querySelector(`#${CSS.escape(tab.dataset.tab)}`);
      if (target) target.hidden = false;

      track("review_tab_open", { tab_name: tab.dataset.tab });
    });
  });

  // Formularz opinii
  const reviewForm = document.querySelector("#review-form");
  const reviewSuccess = document.querySelector("#review-success");
  const reviewError = document.querySelector("#review-error");

  reviewForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!reviewForm.checkValidity()) {
      reviewForm.reportValidity();
      return;
    }

    reviewSuccess.hidden = true;
    reviewError.hidden = true;

    const submitButton = reviewForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Wysyłanie…";

    try {
      const response = await fetch("https://formspree.io/f/mqernzwy", {
        method: "POST",
        body: new FormData(reviewForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Błąd formularza.");

      reviewForm.reset();
      reviewSuccess.hidden = false;
      track("review_form_submit");
    } catch (error) {
      console.error(error);
      reviewError.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Wyślij opinię";
    }
  });
})();
