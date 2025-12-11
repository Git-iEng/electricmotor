/* ==========================================================
   landing-page-solar-system.js
   - Scroll reveal (replays on scroll up/down)
   - Optional: adjust initial hash scroll for fixed header
   - Optional: smooth scroll for [data-scroll-to] anchors
   ========================================================== */

/* ===== CONFIG ===== */
const SOLAR = {
  revealSelector: '.reveal-solar-system',
  inViewClass: 'in-view-solar-system',
  headerSelector: '.header',
  anchorSelector: '[data-scroll-to]'
};

/* ===== Helpers ===== */
function getHeaderOffset() {
  const header = document.querySelector(SOLAR.headerSelector);
  return header ? header.offsetHeight : 0;
}

function smoothScrollTo(targetSelector) {
  if (!targetSelector || !targetSelector.startsWith('#')) return;
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const y = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/* ===== Scroll Reveal that re-triggers on leave ===== */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll(SOLAR.revealSelector).forEach(el => el.classList.add(SOLAR.inViewClass));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add(SOLAR.inViewClass);
      } else {
        // Remove when leaving viewport so it can animate again on return
        el.classList.remove(SOLAR.inViewClass);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(SOLAR.revealSelector).forEach(el => io.observe(el));
})();

/* ===== Smooth in-page scrolling for elements with [data-scroll-to] ===== */
(function initSmoothAnchors() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(SOLAR.anchorSelector);
    if (!trigger) return;

    const href = trigger.getAttribute('href');
    const dataTarget = trigger.getAttribute('data-target');
    const targetSelector = dataTarget || href;

    if (targetSelector && targetSelector.startsWith('#')) {
      e.preventDefault();
      smoothScrollTo(targetSelector);
    }
  });

  // If the page loads with a hash, fix initial position for fixed header
  window.addEventListener('load', () => {
    if (window.location.hash) {
      // Wait a tick so layout is ready
      setTimeout(() => smoothScrollTo(window.location.hash), 0);
    }
  });
})();

/* ==========================================================
   Logos pager (dots) + continuous marquee coexist (robust)
   ========================================================== */
(function initLogosPager() {
  const wrap = document.querySelector('.logos-wrap-solar-system');
  const track = document.getElementById('logos-track-solar-system');
  const dotsWrap = document.getElementById('dots-solar-system');
  if (!wrap || !track || !dotsWrap) return;

  const dots = Array.from(dotsWrap.querySelectorAll('.dot-solar-system'));
  const RESUME_DELAY = 3500; // ms after click before continuous scroll resumes
  let resumeTimer = null;

  // set active dot helper
  function setActiveDot(idx) {
    dots.forEach((d, i) => d.classList.toggle('is-active-solar-system', i === idx));
  }
  setActiveDot(0);

  // compute page width (use visible viewport of the logos)
  function pageWidth() { return wrap.clientWidth; }

  // Fully disable CSS animation and let us control transform
  function enterManualMode() {
    track.classList.add('manual-solar-system');
    track.style.animationPlayState = 'paused';
  }

  // Resume CSS animation from the start smoothly
  function resumeContinuous() {
    // remove manual transform + class and restart animation cleanly
    track.style.transform = '';
    track.classList.remove('manual-solar-system');

    // Restart the CSS animation reliably (toggle to 'none' then back)
    const prevAnim = getComputedStyle(track).animation;
    track.style.animation = 'none';
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    // restore whatever animation was in CSS
    track.style.animation = prevAnim;
    track.style.animationPlayState = 'running';
  }

  // Jump to page n by translating the track
  function goToPage(n) {
    const idx = Math.max(0, Math.min(n, dots.length - 1));
    setActiveDot(idx);

    enterManualMode();

    const offset = -idx * pageWidth();
    track.style.transform = `translateX(${offset}px)`;

    // schedule resume
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(resumeContinuous, RESUME_DELAY);
  }

  // Click handlers on dots
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const n = parseInt(d.getAttribute('data-page') || '0', 10);
      goToPage(n);
    });
  });

  // Maintain the same page on resize while paused
  const ro = new ResizeObserver(() => {
    const active = dots.findIndex(el => el.classList.contains('is-active-solar-system'));
    if (active > -1 && track.classList.contains('manual-solar-system')) {
      track.style.transform = `translateX(${-active * pageWidth()}px)`;
    }
  });
  ro.observe(wwrap = wrap); // observe container width changes

  // Also pause marquee on hover (optional, keeps prior UX)
  wrap.addEventListener('mouseenter', () => {
    if (!track.classList.contains('manual-solar-system')) {
      track.style.animationPlayState = 'paused';
    }
  });
  wrap.addEventListener('mouseleave', () => {
    if (!track.classList.contains('manual-solar-system')) {
      track.style.animationPlayState = 'running';
    }
  });
})();


/* ==========================================================
   Count-up animation for Impact stats
   ========================================================== */
(function initImpactCounters() {
  const items = document.querySelectorAll('.stat-value-solar-system-impact');
  if (!items.length) return;

  function countTo(el) {
    const end = parseFloat(el.getAttribute('data-count-to')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400; // ms (slow & smooth)
    const startTime = performance.now();

    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      // easeOutCubic for a nice finish
      const eased = 1 - Math.pow(1 - p, 3);
      let val = end * eased;

      // If the end has decimals, keep one decimal, else integer
      const hasDecimal = String(end).includes('.');
      el.textContent = prefix + (hasDecimal ? val.toFixed(1) : Math.round(val)) + suffix;

      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (hasDecimal ? end.toFixed(1) : Math.round(end)) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // start counting when visible
        countTo(el);
      } else {
        // reset so it can play again on re-enter
        el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
      }
    });
  }, { threshold: 0.35 });

  items.forEach(el => {
    // initialize to 0 with prefix/suffix
    el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
    io.observe(el);
  });
})();
/* ==========================================================
   Solutions: "View All Solutions" toggle
   ========================================================== */
(function initSolutionsToggle() {
  const grid = document.getElementById('solutions-grid-solar-system-solution');
  const btn = document.getElementById('solutions-toggle-btn-solar-system-solution');
  if (!grid || !btn) return;

  function setState(expanded) {
    grid.classList.toggle('is-collapsed-solar-system-solution', !expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    btn.textContent = expanded ? 'View Fewer' : 'View All Solutions';

    // Nudge IntersectionObserver so reveal animations can trigger for newly shown cards
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  }

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    setState(!expanded);
  });

  // default collapsed on load
  setState(false);
})();
/* ==========================================================
   Solar App: lightweight tilt/parallax for media cards
   Targets elements with [data-tilt]
   ========================================================== */
(function initSolarAppTilt() {
  const els = document.querySelectorAll('[data-tilt]');
  if (!els.length) return;

  const MAX_TILT = 8;         // degrees
  const MAX_TRANS = 10;       // px translate for parallax feel
  const EASE = 'cubic-bezier(.2,.65,.2,1)';

  function applyTilt(el, e) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = (+dy * MAX_TILT).toFixed(2);
    const rotY = (-dx * MAX_TILT).toFixed(2);
    const tx = (-dx * MAX_TRANS).toFixed(2);
    const ty = (-dy * MAX_TRANS).toFixed(2);

    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${tx}px, ${ty}px)`;
    el.style.transition = 'transform .08s';
  }

  function resetTilt(el) {
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translate(0,0)';
    el.style.transition = `transform .5s ${EASE}`;
  }

  els.forEach(el => {
    el.addEventListener('pointermove', (e) => applyTilt(el, e));
    el.addEventListener('pointerleave', () => resetTilt(el));
    el.addEventListener('pointerdown', () => resetTilt(el)); // prevent sticky tilt on touch
  });
})();


/* ==========================================================
   Projects carousel: arrows scroll by one full "page"
   ========================================================== */
(function initProjectsCarousel() {
  const viewport = document.getElementById('projects-viewport-solar-system-projects');
  const prevBtn = document.querySelector('.prev-solar-system-projects');
  const nextBtn = document.querySelector('.next-solar-system-projects');
  if (!viewport || !prevBtn || !nextBtn) return;

  function updateButtons() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 0;
    const atEnd = viewport.scrollLeft >= maxScroll - 1;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
  }

  function scrollPage(dir) {
    const distance = viewport.clientWidth; // page = visible width
    viewport.scrollBy({ left: dir * distance, behavior: 'smooth' });
    // optimistic button state; will correct on 'scroll' event
    setTimeout(updateButtons, 350);
  }

  prevBtn.addEventListener('click', () => scrollPage(-1));
  nextBtn.addEventListener('click', () => scrollPage(1));

  // keep buttons in sync
  viewport.addEventListener('scroll', () => {
    // debounced update
    window.clearTimeout(viewport._btnTimer);
    viewport._btnTimer = setTimeout(updateButtons, 80);
  });
  window.addEventListener('resize', updateButtons);

  // init
  updateButtons();
})();
// 
/* ==========================================================
   Types tabs: click/keyboard + hash support
   ========================================================== */
(function initSolarTypes() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn-solar-system-types'));
  const panels = {
    'on-grid': document.getElementById('panel-on-grid-solar-system-types'),
    'off-grid': document.getElementById('panel-off-grid-solar-system-types'),
    'hybrid': document.getElementById('panel-hybrid-solar-system-types')
  };
  if (!tabs.length) return;

  function activate(type) {
    // tabs
    tabs.forEach(btn => {
      const isActive = btn.dataset.type === type;
      btn.classList.toggle('is-active-solar-system-types', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      // tabindex for roving focus
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    // panels
    Object.entries(panels).forEach(([key, el]) => {
      const show = key === type;
      if (!el) return;
      el.classList.toggle('is-active-solar-system-types', show);
      el.hidden = !show;
      if (show) {
        // restart small fade-in animation
        el.style.animation = 'none'; el.offsetHeight; el.style.animation = '';
      }
    });
  }

  // Click
  tabs.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.type)));

  // Keyboard: left/right arrows
  document.querySelector('.tabs-solar-system-types')?.addEventListener('keydown', (e) => {
    const idx = tabs.findIndex(b => b.classList.contains('is-active-solar-system-types'));
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (idx + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    }
  });

  // Hash support e.g. #hybrid
  function fromHash() {
    const h = (location.hash || '').replace('#', '').toLowerCase();
    if (['on-grid', 'off-grid', 'hybrid'].includes(h)) activate(h);
  }
  window.addEventListener('hashchange', fromHash);

  // init
  activate('on-grid');
  fromHash();
})();
/* ==========================================================
   Scoped tabs for all .section-types-solar-system-types
   (no global getElementById; supports multiple instances)
   ========================================================== */
(function initAllSolarTypeTabs() {
  document.querySelectorAll('.section-types-solar-system-types').forEach(section => {
    const tabsWrap = section.querySelector('.tabs-solar-system-types');
    if (!tabsWrap) return;

    const tabs = Array.from(section.querySelectorAll('.tab-btn-solar-system-types'));
    const panels = Array.from(section.querySelectorAll('.panel-solar-system-types'));
    if (!tabs.length || !panels.length) return;

    function activate(btn) {
      // Tabs state
      tabs.forEach(t => {
        const isActive = t === btn;
        t.classList.toggle('is-active-solar-system-types', isActive);
        t.setAttribute('aria-selected', String(isActive));
        t.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Panels state (scoped within this section)
      const targetId = btn.getAttribute('aria-controls');
      panels.forEach(p => {
        const show = p.id === targetId;
        p.hidden = !show;
        p.classList.toggle('is-active-solar-system-types', show);
        if (show) { p.style.animation = 'none'; p.offsetHeight; p.style.animation = ''; }
      });
    }

    // Click to activate
    tabs.forEach(btn => btn.addEventListener('click', () => activate(btn)));

    // Keyboard: Left/Right arrows within this tablist
    tabsWrap.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const current = tabs.findIndex(t => t.classList.contains('is-active-solar-system-types'));
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (current + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next]);
    });

    // Init: use the one marked active or the first
    activate(tabs.find(t => t.classList.contains('is-active-solar-system-types')) || tabs[0]);
  });
})();

/* IntersectionObserver reveal - shows elements when they enter the viewport,
   hides them again when they leave (works on scroll down and up). */
(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible-mobility'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible-mobility');
      } else {
        entry.target.classList.remove('is-visible-mobility');
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.-gemini-tab');
  const contents = document.querySelectorAll('.-gemini-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to the clicked tab
      tab.classList.add('active');

      // Find the corresponding content using the data-tab attribute
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-content`);

      // Add active class to the content
      if (content) {
        content.classList.add('active');
      }
    });
  });

  // Set the default active tab and content on page load
  const defaultTab = document.querySelector('.-gemini-tab[data-tab="mission"]');
  const defaultContent = document.getElementById('mission-content');

  if (defaultTab && defaultContent) {
    defaultTab.classList.add('active');
    defaultContent.classList.add('active');
  }
});

(function () {
  const grid = document.getElementById('grid-neplan-card-with-animation');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card-neplan-card-with-animation');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-neplan-card-with-animation');
      } else {
        // remove so it replays when scrolling back (LIFO feel)
        e.target.classList.remove('show-neplan-card-with-animation');
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => io.observe(c));
})();


(() => {
  const SELECTOR = '.reveal-left, .reveal-right, .reveal-up, .reveal-down';

  // Apply per-element delay from data attribute if provided
  document.querySelectorAll(SELECTOR).forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', /^\d+$/.test(d) ? `${d}ms` : d);
  });

  // Auto-stagger children inside a .reveal-group
  document.querySelectorAll('.reveal-group[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 120; // ms
    let i = 0;
    group.querySelectorAll(SELECTOR).forEach(el => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
      i++;
    });
  });

  // Observe and toggle visibility (replays when scrolling back unless .reveal-once)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      else if (!target.classList.contains('reveal-once'))
        target.classList.remove('is-visible');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
})();

/* Intersection Observer for gentle reveals */
(function () {
  const items = document.querySelectorAll('.reveal-lv-electrical-panel-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-panel-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(el => io.observe(el));

  /* Simple form handler (prevent empty submit in demo) */
  const form = document.getElementById('service-form-lv-electrical-panel-');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    // You can hook this to your backend
    alert(`Thanks ${fd.get('name') || ''}! We’ll contact you soon.`);
    form.reset();
  });
})();

/* IntersectionObserver reveal - shows elements when they enter the viewport,
   hides them again when they leave (works on scroll down and up). */
(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible-mobility'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible-mobility');
      } else {
        entry.target.classList.remove('is-visible-mobility');
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.-gemini-tab');
  const contents = document.querySelectorAll('.-gemini-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to the clicked tab
      tab.classList.add('active');

      // Find the corresponding content using the data-tab attribute
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-content`);

      // Add active class to the content
      if (content) {
        content.classList.add('active');
      }
    });
  });

  // Set the default active tab and content on page load
  const defaultTab = document.querySelector('.-gemini-tab[data-tab="mission"]');
  const defaultContent = document.getElementById('mission-content');

  if (defaultTab && defaultContent) {
    defaultTab.classList.add('active');
    defaultContent.classList.add('active');
  }
});

(function () {
  const grid = document.getElementById('grid-neplan-card-with-animation');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card-neplan-card-with-animation');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-neplan-card-with-animation');
      } else {
        // remove so it replays when scrolling back (LIFO feel)
        e.target.classList.remove('show-neplan-card-with-animation');
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => io.observe(c));
})();


(() => {
  const SELECTOR = '.reveal-left, .reveal-right, .reveal-up, .reveal-down';

  // Apply per-element delay from data attribute if provided
  document.querySelectorAll(SELECTOR).forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', /^\d+$/.test(d) ? `${d}ms` : d);
  });

  // Auto-stagger children inside a .reveal-group
  document.querySelectorAll('.reveal-group[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 120; // ms
    let i = 0;
    group.querySelectorAll(SELECTOR).forEach(el => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
      i++;
    });
  });

  // Observe and toggle visibility (replays when scrolling back unless .reveal-once)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      else if (!target.classList.contains('reveal-once'))
        target.classList.remove('is-visible');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
})();

/* Simple reveal on scroll */
(() => {
  const els = document.querySelectorAll('.reveal-lv-electrical-panel-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-panel-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  els.forEach(el => io.observe(el));
})();

// Reveal on scroll for the About section
(() => {
  const items = document.querySelectorAll('.reveal-lv-electrical-about-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-about-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();
// Simple reveal on scroll for the process section
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-process, .reveal-right-lv-electrical-process'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-process');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();
// Reveal-on-scroll for the Why Choose Us section
(() => {
  const targets = document.querySelectorAll(
    '.reveal-left-le-electrical-why-us, .reveal-right-le-electrical-why-us, .reveal-top-le-electrical-why-us, .reveal-bottom-le-electrical-why-us'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in-le-electrical-why-us');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  targets.forEach(t => io.observe(t));
})();

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('servicesGrid');
  const detail = document.getElementById('svcDetail');
  const exploreBtn = document.getElementById('exploreServicesBtn'); // header button if present

  if (!grid || !detail) return;

  // --- DETAILS CONTENT MAP ---
  const detailsMap = {
    


    dcmotors: {
      title: 'DC Motors',
      body: `
    <p>
      A   DC Motor   (Direct Current Motor) is an electrical machine that converts direct current electrical energy into mechanical energy.
      They are characterized by their ability to provide   excellent speed control   over a wide range and produce high starting torque.
    </p>

    <h4>Key Characteristics and Advantages</h4>
    <ul>
      <li>  Precise Speed Control:   Speed can be easily and accurately controlled by varying the armature voltage or field current.</li>
      <li>  High Starting Torque:   Ideal for applications that require significant power to start motion under load, such as cranes and heavy conveyors.</li>
      <li>  Simple Design:   Older DC motors use commutators and brushes, while modern brushless DC (BLDC) motors offer enhanced reliability and reduced maintenance.</li>
      <li>  Fast Response:   Capable of quick acceleration and deceleration, making them suitable for dynamic loads.</li>
    </ul>

    <h4>Applications of DC Motors</h4>
    <ul>
      <li>  Industrial Traction:   Used in electric trains, trolleys, and battery-powered vehicles.</li>
      <li>  Cranes and Hoists:   Essential for lifting heavy loads due to their high starting torque.</li>
      <li>  Rolling Mills:   Used in steel and metal industries where precise speed control during the rolling process is critical.</li>
      <li>  Servo Motors:   Often used in robotics and CNC machines for accurate positioning.</li>
    </ul>
  `,
      image: { src: '../static/images/type1.avif', alt: 'Industrial DC motor with high torque output' }
    },
    synchronousmotors: {
      title: 'Synchronous Motors',
      body: `
    <p>
      A   Synchronous Motor   is an AC motor where, in the steady state, the rotation of the shaft is synchronized with the frequency of the supply current.
      The rotor speed is exactly equal to the synchronous speed, making it an excellent choice for applications requiring   precise, constant speed  .
    </p>

    <h4>Key Characteristics and Advantages</h4>
    <ul>
      <li>  Constant Speed:   Maintains an exact speed regardless of the load variation, provided the load does not exceed the pull-out torque.</li>
      <li>  Power Factor Correction:   Can operate at lagging, unity, or leading power factors, making them useful for improving the overall power factor of an electrical system.</li>
      <li>  High Efficiency:   Generally more efficient in converting electrical energy to mechanical work than induction motors, especially at high power.</li>
    </ul>

    <h4>Applications of Synchronous Motors</h4>
    <ul>
      <li>  Compressors and Large Pumps:   Used in high-power systems where constant speed and high efficiency are necessary.</li>
      <li>  Electric Generators:   Often used in reverse as synchronous generators in power plants.</li>
      <li>  Speed-Critical Applications:   Found in textile mills and other manufacturing processes where timing and synchronization are vital.</li>
      <li>  Load Compensation:   Utilized as synchronous condensers to control voltage stability in transmission systems.</li>
    </ul>
  `,
      image: { src: '../static/images/type2.avif', alt: 'Large synchronous motor used for industrial constancy' }
    },
    '3phaseinduction': {
      title: '3 Phase Induction Motors',
      body: `
    <p>
      The   3 Phase Induction Motor   (or Asynchronous Motor) is the most widely used type of AC electric motor in industrial drive systems.
      It's favored for its   simple, rugged design  , low cost, and minimal maintenance requirements.
      It converts three-phase AC power into mechanical power, with the rotor always rotating slightly slower than the supply frequency (slip).
    </p>
    

    <h4>Key Characteristics and Advantages</h4>
    <ul>
      <li>  Rugged Construction:   Simple design with no brushes or commutators (for squirrel cage type) leads to high reliability.</li>
      <li>  Low Maintenance:   Requires very little routine maintenance compared to DC motors.</li>
      <li>  Cost-Effective:   Economical to manufacture and purchase, making it the industry standard workhorse.</li>
    </ul>

    <h4>Applications of 3 Phase Induction Motors</h4>
    <ul>
      <li>  General Industrial Drives:   Used in conveyor belts, crushers, fans, and blowers.</li>
      <li>  Pumps:   Powering large centrifugal pumps in water treatment and agricultural irrigation.</li>
      <li>  Machine Tools:   Driving lathes, drills, and mills in manufacturing environments.</li>
      <li>  HVAC Systems:   Used extensively in large-scale heating, ventilation, and air conditioning systems.</li>
    </ul>
  `,
      image: { src: '../static/images/type3.avif', alt: 'Industrial three-phase induction motor' }
    },
    singlephaseinduction: {
      title: 'Single Phase Induction Motors',
      body: `
    <p>
      A   Single Phase Induction Motor   operates on a single-phase AC supply and is common in low-power residential and small industrial applications.
      Unlike three-phase motors, a single-phase supply does not produce a rotating magnetic field naturally, so these motors require an auxiliary winding and a starting mechanism (like a capacitor) to initiate rotation.
    </p>

    <h4>Key Characteristics and Applications</h4>
    <ul>
      <li>  Simplicity and Portability:   Small, lightweight, and easy to install for single-phase power sources.</li>
      <li>  Domestic Use:   The most common motor type found in home appliances like refrigerators, washing machines, and fans.</li>
      <li>  Small-Scale Industrial:   Used in packaging machines, small compressors, portable tools, and office equipment.</li>
    </ul>

    <h4>Common Types</h4>
    <ul>
      <li>  Capacitor Start/Run Motors:   Provide high starting torque, often used in compressors and pumps.</li>
      <li>  Split-Phase Motors:   Economical but with lower starting torque, suitable for fans and small machine tools.</li>
      <li>  Shaded Pole Motors:   Very simple, low-power, and low-cost, typically used in small fans and blowers.</li>
    </ul>
  `,
      image: { src: '../static/images/type4.avif', alt: 'Single-phase induction motor with starting capacitor' }
    },
    bearings: {
      title: 'Ball & Roller Bearings',
      body: `
    <p>
        Bearings   are machine elements that constrain relative motion and reduce friction between moving parts.
      We focus on supplying very high-quality   Ball and Roller Bearings   to ensure the longevity and efficiency of industrial machinery, electric motors, and equipment in harsh environments.
    </p>
    

    <h4>Types and Functions</h4>
    <ul>
      <li>  Ball Bearings:   Use spherical balls to maintain the separation between the moving parts. Best for high-speed applications and handling radial and light thrust loads.</li>
      <li>  Roller Bearings:   Use cylindrical, tapered, or spherical rollers. Designed to handle significantly higher radial loads than ball bearings.</li>
      <li>  Thrust Bearings:   Designed to primarily handle axial (thrust) loads, often found in rotary shafts.</li>
    </ul>

    <h4>The iEngineering Advantage</h4>
    <ul>
      <li>  Cost-Effective Quality:   Sourced from vetted manufacturer networks in Japan, China, and Europe to offer the best price-to-quality ratio.</li>
      <li>  Increased Competitiveness:   High-quality components reduce downtime and maintenance, allowing our clients (distributors, OEMs) to increase sales margins.</li>
      <li>  Application-Specific Sourcing:   We match the perfect bearing solution to your specific load, speed, and environmental needs.</li>
    </ul>
  `,
      image: {
        src: "../static/images/type5.avif",
        alt: "Precision ball and roller bearings for industrial machinery"
      }
    },
    specialmotors: {
      title: 'Special Motors & Components',
      body: `
    <p>
        Special Motors   are electric machines designed for specific, non-standard operating requirements across a range of specialized applications.
      These motors and components address unique needs such as high torque, extreme operating environments, or specialized control systems.
    </p>

    <h4>Types of Special Motors and Components</h4>
    <ul>
      <li>  Synchronous Condensers:   Used not for mechanical work, but for power factor correction and voltage regulation in large power grids.</li>
      <li>  Servo Motors:   Used in automation and robotics for precise angular position, velocity, and acceleration control.</li>
      <li>  Stepper Motors:   DC motors that divide a full rotation into a number of equal steps, used for precision positioning in 3D printers and scanners.</li>
      <li>  Explosion-Proof Motors:   Designed for hazardous locations (e.g., chemical plants, mines) where flammable gases or dust may be present.</li>
      <li>  Specialty Bearings:   Components like magnetic or hydrostatic bearings for ultra-high-speed or extremely low-friction environments.</li>
    </ul>

    <h4>Use Cases</h4>
    <ul>
      <li>  Heavy Industry:   Motors designed for high-impact or continuous-duty applications like cement kilns or mining conveyors.</li>
      <li>  Automation:   Servo and stepper motors for assembly lines, packaging, and high-precision manufacturing.</li>
      <li>  Marine/Offshore:   Motors with marine-grade materials and enclosures to withstand corrosive environments.</li>
    </ul>
  `,
      image: { src: '../static/images/type6.avif', alt: 'Specialized electric motor designed for high precision or hazardous environments' }
    },


  };

  // --- RENDER DETAILS (single function) ---
  function openDetails(key) {
    const data = detailsMap[key];
    if (!data) return;

    const imgHTML = data.image
      ? `<figure class="svc-detail-figure"><img class="svc-detail-img" src="${data.image.src}" alt="${data.image.alt || ''}"></figure>`
      : '';

    detail.innerHTML = `
      <div class="svc-detail-layout">
        ${imgHTML}
        <div class="svc-detail-copy">
          <h3>${data.title}</h3>
          ${data.body || ''}
        </div>
      </div>
    `;
    detail.style.display = 'block';
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeDetails() {
    detail.style.display = 'none';
    detail.innerHTML = '';
  }

  // --- CLICK HANDLER (delegated) ---
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.svc-cta-lv-electrical-services');
    if (!btn) return;
    const key = btn.getAttribute('data-detail');
    const currentTitle = detail.querySelector('h3')?.textContent || '';
    if (detail.style.display === 'block' && currentTitle === (detailsMap[key]?.title || '')) {
      closeDetails();
    } else {
      openDetails(key);
    }
  });

  // --- EXPLORE / VIEW LESS toggle (uses .is-hidden on extra cards) ---
  if (exploreBtn) {
    const allCards = Array.from(grid.querySelectorAll('.svc-item-lv-electrical-services'));
    const extraCards = allCards.slice(3); // cards 4..7
    let expanded = false;

    function setExpanded(state) {
      expanded = state;
      if (expanded) {
        extraCards.forEach(el => el.classList.remove('is-hidden'));
        exploreBtn.textContent = 'View Less';
        exploreBtn.setAttribute('aria-expanded', 'true');

      } else {
        extraCards.forEach(el => el.classList.add('is-hidden'));
        closeDetails();
        exploreBtn.textContent = 'Explore Types';
        exploreBtn.setAttribute('aria-expanded', 'false');

      }
      // retrigger reveal animations if you use them
      extraCards.forEach(el => {
        el.classList.remove('reveal-in-lv-electrical-services');
        void el.offsetWidth;
      });
    }

    // init collapsed
    setExpanded(false);

    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setExpanded(!expanded);
    });
  }

  // --- SCROLL REVEAL (bi-directional) ---
  const revealEls = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in-lv-electrical-services');
      } else {
        entry.target.classList.remove('reveal-in-lv-electrical-services');
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => io.observe(el));
});
(() => {
  const modal = document.getElementById('csc-modal');
  const form = document.getElementById('csc-form');
  const close = modal.querySelector('.modal-close-csc-solar-system-csc-products');
  const successPane = document.getElementById('csc-success');
  const docNameInput = document.getElementById('csc-doc-name');

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    successPane.hidden = true;
    form.hidden = false;
    form.reset();
    setTimeout(() => document.getElementById('csc-name')?.focus(), 50);
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Open from each "Request Download" button
  document.querySelectorAll('.request-download-csc-solar-system-csc-products').forEach(btn => {
    btn.addEventListener('click', () => {
      docNameInput.value = btn.dataset.doc || '';
      openModal();
    });
  });

  // Close handlers
  close.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop-csc-solar-system-csc-products')
    .addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
(function () {
  // Reveal on scroll
  const els = document.querySelectorAll('.reveal-cmms-all-features');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  els.forEach(el => io.observe(el));

  // Make keyboard Enter activate cards nicely
  document.querySelectorAll('.card-cmms-all-features').forEach(a => {
    a.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        a.click();
      }
    });
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const faqCards = document.querySelectorAll(".faq-card");

  faqCards.forEach(card => {
    const question = card.querySelector("h4");
    question.addEventListener("click", () => {
      // Collapse all other open cards
      faqCards.forEach(c => {
        if (c !== card) c.classList.remove("active");
      });
      // Toggle the clicked one
      card.classList.toggle("active");
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".testimonial-track");
  const slides = document.querySelectorAll(".testimonial-card");
  const prev = document.querySelector(".arrow.left");
  const next = document.querySelector(".arrow.right");

  let index = 0;
  const total = slides.length;

  function showSlide(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() { showSlide(index + 1); }
  function prevSlide() { showSlide(index - 1); }

  next.addEventListener("click", nextSlide);
  prev.addEventListener("click", prevSlide);

  // Auto slide every 5 seconds
  let autoSlide = setInterval(nextSlide, 5000);

  // Pause auto on hover
  document.querySelector(".testimonial-slider").addEventListener("mouseenter", () => clearInterval(autoSlide));
  document.querySelector(".testimonial-slider").addEventListener("mouseleave", () => autoSlide = setInterval(nextSlide, 5000));
});


(function () {
  const viewport = document.querySelector('.t-viewport');
  const track = document.querySelector('.t-track');
  const prevBtn = document.querySelector('.t-arrow.prev');
  const nextBtn = document.querySelector('.t-arrow.next');

  let slides = Array.from(track.children);
  let index = 0;
  let isAnimating = false;
  const gapPx = 24;
  const intervalMs = 4000;

  // Determine how many cards are visible (1 on mobile, 2 on desktop)
  function visibleCount() {
    return window.matchMedia('(max-width: 900px)').matches ? 1 : 2;
  }

  // Prepare infinite: clone first (visibleCount + 2) slides to the end
  function primeClones() {
    // remove old clones first
    Array.from(track.querySelectorAll('.t-clone')).forEach(n => n.remove());
    const vc = visibleCount();
    const cloneN = Math.min(slides.length, vc + 2);
    for (let i = 0; i < cloneN; i++) {
      const c = slides[i].cloneNode(true);
      c.classList.add('t-clone');
      track.appendChild(c);
    }
    slides = Array.from(track.children);
  }

  function cardWidth() {
    // card width + gap
    const vc = visibleCount();
    const vpW = viewport.clientWidth;
    if (vc === 1) return vpW; // 100%
    // (100% - gap)/2
    return (vpW - gapPx) / 2;
  }

  function goTo(newIndex, withTransition = true) {
    if (isAnimating) return;
    isAnimating = true;

    const shift = -newIndex * (cardWidth() + gapPx);
    track.style.transition = withTransition ? 'transform .45s ease' : 'none';
    track.style.transform = `translateX(${shift}px)`;

    track.addEventListener('transitionend', onDone, { once: true });
    if (!withTransition) isAnimating = false;

    function onDone() {
      // If we moved beyond the last real slide, snap back
      const vc = visibleCount();
      const maxRealIndex = document.querySelectorAll('.t-track > :not(.t-clone)').length - vc;
      if (newIndex > maxRealIndex) {
        index = 0;
        const snap = -index * (cardWidth() + gapPx);
        track.style.transition = 'none';
        track.style.transform = `translateX(${snap}px)`;
      } else {
        index = newIndex;
      }
      isAnimating = false;
    }
  }

  function next() { goTo(index + 1); }
  function prev() {
    if (isAnimating) return;
    const vc = visibleCount();
    const realCount = document.querySelectorAll('.t-track > :not(.t-clone)').length;
    if (index === 0) {
      // jump to the last visible start, then animate back one
      const maxStart = Math.max(0, realCount - vc);
      const jump = -maxStart * (cardWidth() + gapPx);
      track.style.transition = 'none';
      track.style.transform = `translateX(${jump}px)`;
      index = maxStart;
      requestAnimationFrame(() => requestAnimationFrame(() => goTo(index - 1)));
    } else {
      goTo(index - 1);
    }
  }

  // Auto-play (pause on hover/focus)
  let timer = null;
  function start() { stop(); timer = setInterval(next, intervalMs); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', start);

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  window.addEventListener('resize', () => {
    // Re-prime on layout change
    primeClones();
    goTo(index, false);
  });

  // Init
  primeClones();
  goTo(0, false);
  start();
})();
