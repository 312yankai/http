/* 站点交互：主题切换 / 移动端导航 / 滚动动效 / 导航高亮 / 配置注入 */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var root = document.documentElement;

  /* ---------- 1. 主题：默认深色，可切换并记忆 ---------- */
  var STORAGE_KEY = "site-theme";
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
      btn.textContent = theme === "dark" ? "☀" : "☾";
    }
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(saved || (prefersLight ? "light" : "dark"));
  }
  initTheme();

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  /* ---------- 2. 移动端导航 ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 3. 顶部导航滚动状态 + 当前板块高亮 ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var sections = [].slice.call(document.querySelectorAll("section[id]"));
  var navLinks = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 4. 进场动画 ---------- */
  var revealables = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { ro.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 5. 注入配置：社交链接 / 邮箱 / 版权年份 ---------- */
  var ICONS = {
    github: '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/></svg>',
    rss: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.6" fill="currentColor" stroke="none"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12A5 5 0 0 0 12.12 3.8L11 4.9"/><path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12A5 5 0 0 0 11.9 20.2L13 19.1"/></svg>'
  };

  function socialMarkup() {
    return (CFG.socials || []).map(function (s) {
      var icon = ICONS[s.icon] || ICONS.link;
      var external = /^https?:/i.test(s.url);
      return '<a class="social-link" href="' + s.url + '"' +
        (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
        ' title="' + s.label + '" aria-label="' + s.label + '">' + icon +
        '<span>' + s.label + '</span></a>';
    }).join("");
  }

  [].slice.call(document.querySelectorAll("[data-socials]")).forEach(function (el) {
    el.innerHTML = socialMarkup();
  });

  [].slice.call(document.querySelectorAll("[data-email]")).forEach(function (el) {
    if (!CFG.email) return;
    el.textContent = CFG.email;
    el.setAttribute("href", "mailto:" + CFG.email);
  });

  [].slice.call(document.querySelectorAll("[data-name]")).forEach(function (el) {
    el.textContent = CFG.name || el.textContent;
  });

  [].slice.call(document.querySelectorAll("[data-year]")).forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 6. 一键复制邮箱 ---------- */
  var copyBtn = document.getElementById("copy-email");
  if (copyBtn && CFG.email) {
    copyBtn.addEventListener("click", function () {
      var done = function () {
        var old = copyBtn.textContent;
        copyBtn.textContent = "已复制 ✓";
        copyBtn.classList.add("is-copied");
        setTimeout(function () {
          copyBtn.textContent = old;
          copyBtn.classList.remove("is-copied");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CFG.email).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = CFG.email;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  /* ---------- 7. 项目卡片跟随光标的光晕 ---------- */
  [].slice.call(document.querySelectorAll(".project")).forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- 8. 项目筛选 ---------- */
  var filters = [].slice.call(document.querySelectorAll("[data-filter]"));
  var cards = [].slice.call(document.querySelectorAll("[data-tags]"));
  if (filters.length && cards.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-tags") || "").split(",");
          var show = key === "all" || tags.indexOf(key) > -1;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }
})();
