/*
  ENCORE — main.js
  Navigation, theme, reveals, and the two interactive modules
  (Sound & Band Finder on index, Stage Configurator on home2).
*/

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     Mobile drawer
  --------------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const drawerClose = document.querySelector('.drawer-close');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.overlay');

  if (hamburger && mobileDrawer && overlay) {
    const setDrawer = (open) => {
      mobileDrawer.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
      document.body.classList.toggle('no-scroll', open);
      hamburger.setAttribute('aria-expanded', String(open));
    };

    hamburger.addEventListener('click', () => setDrawer(!mobileDrawer.classList.contains('open')));
    if (drawerClose) drawerClose.addEventListener('click', () => setDrawer(false));
    overlay.addEventListener('click', () => setDrawer(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) setDrawer(false);
    });
    mobileDrawer.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => setDrawer(false));
    });
  }

  /* ---------------------------------------------------------
     Theme (persisted, with icon swap)
  --------------------------------------------------------- */
  const themeToggles = document.querySelectorAll('.theme-toggle');

  const paintThemeIcons = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) icon.className = isDark ? 'ph-light ph-sun' : 'ph-light ph-moon';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  paintThemeIcons();

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', next);
      paintThemeIcons();
    });
  });

  /* ---------------------------------------------------------
     RTL toggle (persisted)
  --------------------------------------------------------- */
  const rtlToggles = document.querySelectorAll('.rtl-toggle');

  // The logo SVG has a mirrored twin with the icon on the right.
  const syncLogos = () => {
    const rtl = document.documentElement.getAttribute('dir') === 'rtl';
    document.querySelectorAll('img.logo-img').forEach(img => {
      const src = img.getAttribute('src');
      const next = rtl
        ? src.replace(/(encore|atelier)-logo\.svg$/, '$1-logo-rtl.svg')
        : src.replace(/(encore|atelier)-logo-rtl\.svg$/, '$1-logo.svg');
      if (next !== src) img.setAttribute('src', next);
    });
  };

  if (localStorage.getItem('rtl') === 'rtl') document.documentElement.setAttribute('dir', 'rtl');
  syncLogos();

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      root.classList.add('dir-switching');
      root.setAttribute('dir', next);
      localStorage.setItem('rtl', next);
      syncLogos();
      // Two frames: let the new layout paint before transitions come back.
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('dir-switching')));
    });
  });

  /* ---------------------------------------------------------
     Scroll state: condensed header + progress hairline
  --------------------------------------------------------- */
  const progress = document.querySelector('.scroll-progress');
  let ticking = false;

  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'back-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<i class="ph-light ph-arrow-up"></i>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(toTop);

  const onScroll = () => {
    const y = window.scrollY;
    document.body.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      revealables.forEach(el => io.observe(el));
    } else {
      revealables.forEach(el => el.classList.add('is-visible'));
    }
  }

  /* ---------------------------------------------------------
     Count-up stats
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countIO.observe(el));
  }

  /* ---------------------------------------------------------
     Password reveal
  --------------------------------------------------------- */
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      btn.innerHTML = `<i class="ph-light ph-eye${reveal ? '-slash' : ''}"></i>`;
      btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', String(reveal));
      input.focus();
    });
  });

  /* ---------------------------------------------------------
     Generic form validation
  --------------------------------------------------------- */
  document.querySelectorAll('form.needs-validation').forEach(form => {
    form.addEventListener('submit', (e) => {
      let isValid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
        field.classList.toggle('error', empty);
        if (empty) isValid = false;
      });

      // The terms checkbox sits inside its own label, so colour the label.
      const terms = form.querySelector('#terms');
      if (terms) {
        const label = terms.closest('label') || terms.nextElementSibling;
        if (label) label.style.color = terms.checked ? '' : '#C0392B';
        if (!terms.checked) isValid = false;
      }

      const formError = form.querySelector('.form-error-msg');
      if (!isValid) {
        e.preventDefault();
        if (formError) formError.style.display = 'block';
        const firstBad = form.querySelector('.error');
        if (firstBad) firstBad.focus();
      } else if (formError) {
        formError.style.display = 'none';
      }
    });

    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  });

  /* =========================================================
     HERO DECK — Headliner Spotlight Switcher (index.html)
     ========================================================= */
  const heroDeck = document.querySelector('[data-hero-deck]');

  if (heroDeck) {
    const ACTS = {
      velvet: {
        status: '2026 Dates Open',
        tag: 'Featured Headliner · 10-Piece',
        name: 'The Velvet Brass',
        desc: 'Blazing four-piece horns, three dynamic lead vocalists, and unstoppable Motown & soul energy.',
        specs: ['4-Piece Horns', '3 × 45m Sets', 'Pro FOH Included'],
        price: '$3,500',
        img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
        alt: 'The Velvet Brass ten-piece soul and horn showband live on stage',
        href: 'bookings.html?gown=The%20Velvet%20Brass&order=1'
      },
      midnight: {
        status: 'Gala Favorite',
        tag: 'Velvet Lounge · 4-Piece',
        name: 'Midnight Blue Quartet',
        desc: 'Smoky tenor sax, upright bass, and brushed swing standards tailored for black-tie cocktail hours.',
        specs: ['Tenor Sax & Bass', '3 × 45m Sets', 'Acoustic / PA Ready'],
        price: '$2,800',
        img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop',
        alt: 'Midnight Blue Quartet jazz ensemble performing under warm stage light',
        href: 'bookings.html?gown=Midnight%20Blue%20Quartet&order=1'
      },
      neon: {
        status: 'Touring Act',
        tag: 'Arena Electric · 5-Piece',
        name: 'Neon Pulse',
        desc: 'Anthemic electric guitars, analog synths, and high-voltage stadium pop hooks until midnight.',
        specs: ['Dual Vocals & Synth', '2 × 60m Sets', 'DMX Lighting Rig'],
        price: '$3,200',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
        alt: 'Neon Pulse indie rock and synth band performing on an electric stage',
        href: 'bookings.html?gown=Neon%20Pulse&order=1'
      }
    };

    const tabs = heroDeck.querySelectorAll('.hero-deck-tab');
    const imgEl = heroDeck.querySelector('[data-deck-img]');
    const statusEl = heroDeck.querySelector('[data-deck-status]');
    const tagEl = heroDeck.querySelector('[data-deck-tag]');
    const nameEl = heroDeck.querySelector('[data-deck-name]');
    const descEl = heroDeck.querySelector('[data-deck-desc]');
    const specsEl = heroDeck.querySelector('[data-deck-specs]');
    const priceEl = heroDeck.querySelector('[data-deck-price]');
    const ctaEl = heroDeck.querySelector('[data-deck-cta]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const act = ACTS[tab.dataset.act];
        if (!act) return;

        tabs.forEach(t => {
          const on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });

        if (imgEl) {
          imgEl.style.opacity = '0.35';
          setTimeout(() => {
            imgEl.src = act.img;
            imgEl.alt = act.alt;
            imgEl.style.opacity = '1';
          }, 150);
        }
        if (statusEl) statusEl.textContent = act.status;
        if (tagEl) tagEl.textContent = act.tag;
        if (nameEl) nameEl.textContent = act.name;
        if (descEl) descEl.textContent = act.desc;
        if (specsEl) specsEl.innerHTML = act.specs.map(s => `<span>${s}</span>`).join('');
        if (priceEl) priceEl.textContent = act.price;
        if (ctaEl) ctaEl.href = act.href;
      });
    });
  }

  /* =========================================================
     INTERACTIVE 1 — Sound & Band Finder (index.html)
     A three-question live music quiz that scores each band
     archetype and reveals the closest match on our roster.
     ========================================================= */
  const finder = document.querySelector('[data-finder]');

  if (finder) {
    const MATCHES = {
      classic: {
        name: 'The Velvet Brass',
        line: '10-Piece Showband · Soul & Motown',
        tag: 'Your headliner match',
        copy: 'Blazing four-piece horns, three dynamic lead vocalists, and a rhythm section that keeps the dance floor packed from the first downbeat to the final encore.',
        meta: { Ensemble: '10-Piece', Genre: 'Soul & Funk', Sets: '3 × 45 Min', From: '$3,500' },
        img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2000&auto=format&fit=crop'
      },
      romantic: {
        name: 'Midnight Blue Quartet',
        line: 'Jazz & Swing · Tenor Sax & Upright Bass',
        tag: 'Your headliner match',
        copy: 'Velvet brass, brushed drums, and smoky vocal standards tailored for black-tie galas, candlelit receptions, and sophisticated cocktail hours.',
        meta: { Ensemble: 'Quartet', Genre: 'Vintage Jazz', Sets: '3 × 45 Min', From: '$2,800' },
        img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2000&auto=format&fit=crop'
      },
      modern: {
        name: 'Neon Pulse',
        line: '5-Piece Electric · Indie Rock & Synth Pop',
        tag: 'Your headliner match',
        copy: 'Anthemic electric guitars, analog synths, and high-energy stadium hooks — built for modern loft parties, brand launches, and late-night festival stages.',
        meta: { Ensemble: '5-Piece', Genre: 'Indie & Pop', Sets: '2 × 60 Min', From: '$3,200' },
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop'
      },
      ethereal: {
        name: 'Aether Strings',
        line: '4-Piece Ensemble · Electric & Classical Strings',
        tag: 'Your headliner match',
        copy: 'Soaring cello and violin arrangements reimagining modern hits and timeless classics for open-air estates, ceremonies, and golden-hour terraces.',
        meta: { Ensemble: 'Quartet', Genre: 'Modern Strings', Sets: '2 × 60 Min', From: '$2,100' },
        img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2000&auto=format&fit=crop'
      }
    };

    const steps = Array.from(finder.querySelectorAll('.finder-step'));
    const result = finder.querySelector('.finder-result');
    const dots = Array.from(finder.querySelectorAll('.finder-progress .dot'));
    const counter = finder.querySelector('.finder-step-count');
    const backBtn = finder.querySelector('.finder-back:not([data-finder-restart])');
    const restart = finder.querySelector('[data-finder-restart]');
    const hint = finder.querySelector('.finder-hint');
    const visuals = Array.from(finder.querySelectorAll('.fv-img'));
    const capTag = finder.querySelector('[data-fv-tag]');
    const capTitle = finder.querySelector('[data-fv-title]');

    let index = 0;
    const answers = [];

    const showVisual = (key) => {
      visuals.forEach(v => v.classList.toggle('is-active', v.dataset.key === key));
    };

    const paintChrome = () => {
      dots.forEach((d, i) => d.classList.toggle('done', i <= index - 1 || (index >= steps.length)));
      if (counter) {
        counter.textContent = index >= steps.length
          ? 'Your match'
          : `Question ${index + 1} of ${steps.length}`;
      }
      const done = index >= steps.length;
      if (backBtn) backBtn.classList.toggle('is-hidden', index === 0 || done);
      if (restart) restart.classList.toggle('is-hidden', !done);
      if (hint) hint.textContent = done ? 'Your rider selections travel with you' : 'Takes about 20 seconds';
    };

    const render = () => {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index && index < steps.length));
      if (result) result.classList.toggle('is-active', index >= steps.length);
      paintChrome();

      if (index < steps.length) {
        const preview = steps[index].dataset.visual;
        if (preview) showVisual(preview);
        const cur = steps[index];
        if (capTag) capTag.textContent = cur.dataset.capTag || 'Encore Roster';
        if (capTitle) capTitle.textContent = cur.dataset.capTitle || '';
      }
    };

    const computeMatch = () => {
      const tally = {};
      answers.forEach(key => { tally[key] = (tally[key] || 0) + 1; });
      return Object.keys(tally).reduce((best, key) => {
        if (tally[key] > tally[best]) return key;
        if (tally[key] === tally[best] && key === answers[answers.length - 1]) return key;
        return best;
      }, answers[answers.length - 1]);
    };

    const reveal = () => {
      const key = computeMatch();
      const match = MATCHES[key] || MATCHES.classic;

      finder.querySelector('[data-result-tag]').textContent = match.tag;
      finder.querySelector('[data-result-name]').textContent = match.name;
      finder.querySelector('[data-result-copy]').textContent = match.copy;

      const metaWrap = finder.querySelector('[data-result-meta]');
      metaWrap.innerHTML = Object.entries(match.meta)
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
        .join('');

      const bookLink = finder.querySelector('[data-result-book]');
      if (bookLink) bookLink.href = `bookings.html?gown=${encodeURIComponent(match.name)}`;

      showVisual(key);
      if (capTag) capTag.textContent = match.line;
      if (capTitle) capTitle.textContent = match.name;
    };

    finder.querySelectorAll('.finder-option').forEach(option => {
      option.addEventListener('click', () => {
        const stepEl = option.closest('.finder-step');
        stepEl.querySelectorAll('.finder-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        answers[index] = option.dataset.value;
        index += 1;

        if (index >= steps.length) reveal();
        render();
      });

      option.addEventListener('mouseenter', () => {
        if (index < steps.length && option.dataset.value) showVisual(option.dataset.value);
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (index === 0) return;
        index -= 1;
        answers.length = index;
        render();
      });
    }

    if (restart) {
      restart.addEventListener('click', () => {
        index = 0;
        answers.length = 0;
        finder.querySelectorAll('.finder-option').forEach(o => o.classList.remove('selected'));
        render();
      });
    }

    render();
  }

  /* =========================================================
     INTERACTIVE 2 — Stage Configurator (home2.html)
     Live band configurator: genre, ensemble size, sets, stage mood, PA rig.
     Updates the stage visual, running quote and booking link.
     ========================================================= */
  const studio = document.querySelector('[data-studio]');

  if (studio) {
    const SILHOUETTES = {
      classic:  { label: 'Soul & Funk',      price: 3500, img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2000&auto=format&fit=crop', gown: 'The Velvet Brass' },
      romantic: { label: 'Jazz & Swing',     price: 2800, img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2000&auto=format&fit=crop', gown: 'Midnight Blue Quartet' },
      modern:   { label: 'Indie & Rock',     price: 3200, img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop', gown: 'Neon Pulse' },
      sheath:   { label: 'Strings & Acoustic', price: 2100, img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2000&auto=format&fit=crop', gown: 'Aether Strings' }
    };

    const FABRICS = {
      mikado:    { label: 'Core Lineup (5 Pc)',     price: 0 },
      lace:      { label: 'Full Horn Section (+3)', price: 950 },
      crepe:     { label: 'Dual Lead Vocalists',    price: 450 },
      georgette: { label: '10-Piece Showband',      price: 1400 }
    };

    const TRAINS = {
      brush:     { label: '2 × 45m Sets',     price: 0 },
      chapel:    { label: '3 × 45m Sets',     price: 400 },
      cathedral: { label: 'Full Night (4 Hr)', price: 850 }
    };

    const TONES = {
      ivory:     { label: 'Spotlight Warm',  tint: 'rgba(255,253,248,0)' },
      champagne: { label: 'Amber Festival',  tint: 'rgba(245,158,11,0.28)' },
      blush:     { label: 'Neon Magenta',    tint: 'rgba(236,72,153,0.28)' },
      pearl:     { label: 'Midnight Indigo', tint: 'rgba(79,70,229,0.30)' }
    };

    const VEIL_PRICE = 550;

    const DEFAULTS = { silhouette: 'classic', fabric: 'mikado', train: 'chapel', tone: 'ivory', veil: true };
    const state = { ...DEFAULTS };

    const layers = Array.from(studio.querySelectorAll('.studio-layer'));
    const veilEl = studio.querySelector('.studio-veil');
    const tintEl = studio.querySelector('.studio-tint');
    const veilSwitch = studio.querySelector('[data-studio-veil]');
    const money = (n) => '$' + n.toLocaleString('en-US');

    const total = () =>
      SILHOUETTES[state.silhouette].price +
      FABRICS[state.fabric].price +
      TRAINS[state.train].price +
      (state.veil ? VEIL_PRICE : 0);

    const setText = (selector, value) => {
      const el = studio.querySelector(selector);
      if (el) el.textContent = value;
    };

    const render = () => {
      // Visual
      layers.forEach(l => l.classList.toggle('is-active', l.dataset.key === state.silhouette));
      if (tintEl) {
        tintEl.style.backgroundColor = TONES[state.tone].tint;
        tintEl.style.opacity = state.tone === 'ivory' ? '0' : '1';
      }
      if (veilEl) veilEl.classList.toggle('is-on', state.veil);

      // Selected states
      studio.querySelectorAll('[data-opt]').forEach(btn => {
        btn.classList.toggle('selected', state[btn.dataset.opt] === btn.dataset.value);
        btn.setAttribute('aria-pressed', String(state[btn.dataset.opt] === btn.dataset.value));
      });
      if (veilSwitch) veilSwitch.setAttribute('aria-pressed', String(state.veil));

      // Labels
      setText('[data-cur-silhouette]', SILHOUETTES[state.silhouette].label);
      setText('[data-cur-fabric]', FABRICS[state.fabric].label);
      setText('[data-cur-train]', TRAINS[state.train].label);
      setText('[data-cur-tone]', TONES[state.tone].label);

      // Stage caption
      setText('[data-studio-gown]', SILHOUETTES[state.silhouette].gown);
      setText('[data-studio-line]',
        `${SILHOUETTES[state.silhouette].label} · ${FABRICS[state.fabric].label} · ${TONES[state.tone].label}`);

      // Summary
      setText('[data-sum-base]', `${SILHOUETTES[state.silhouette].label} — ${money(SILHOUETTES[state.silhouette].price)}`);
      setText('[data-sum-fabric]', FABRICS[state.fabric].price
        ? `${FABRICS[state.fabric].label} — +${money(FABRICS[state.fabric].price)}`
        : `${FABRICS[state.fabric].label} — included`);
      setText('[data-sum-train]', TRAINS[state.train].price
        ? `${TRAINS[state.train].label} — +${money(TRAINS[state.train].price)}`
        : `${TRAINS[state.train].label} — included`);
      setText('[data-sum-veil]', state.veil ? `Pro PA & FOH Engineer — +${money(VEIL_PRICE)}` : 'Venue in-house PA');

      const t = total();
      setText('[data-studio-total]', money(t));
      setText('[data-studio-price]', money(t));

      const book = studio.querySelector('[data-studio-book]');
      if (book) {
        const params = new URLSearchParams({
          gown: SILHOUETTES[state.silhouette].gown,
          fabric: FABRICS[state.fabric].label,
          train: TRAINS[state.train].label,
          tone: TONES[state.tone].label,
          veil: state.veil ? 'yes' : 'no'
        });
        book.href = `bookings.html?${params.toString()}`;
      }
    };

    studio.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        state[btn.dataset.opt] = btn.dataset.value;
        render();
      });
    });

    if (veilSwitch) {
      veilSwitch.addEventListener('click', () => {
        state.veil = !state.veil;
        render();
      });
    }

    const reset = studio.querySelector('[data-studio-reset]');
    if (reset) {
      reset.addEventListener('click', () => {
        Object.assign(state, DEFAULTS);
        render();
      });
    }

    render();
  }

  /* ---------------------------------------------------------
     Featured testimonial rotator
  --------------------------------------------------------- */
  const tf = document.querySelector('[data-testimonials]');

  if (tf) {
    const slides = Array.from(tf.querySelectorAll('.tf-slide'));
    const images = Array.from(tf.querySelectorAll('.tf-img'));
    const dots = Array.from(tf.querySelectorAll('.tf-dot'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = 0;
    let timer = null;

    const show = (n) => {
      current = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      images.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if (!reduced && slides.length > 1) timer = setInterval(() => show(current + 1), 7000);
    };
    const goto = (n) => { show(n); start(); };

    dots.forEach((dot, i) => dot.addEventListener('click', () => goto(i)));
    tf.querySelector('[data-tf-prev]')?.addEventListener('click', () => goto(current - 1));
    tf.querySelector('[data-tf-next]')?.addEventListener('click', () => goto(current + 1));

    // Don't advance out from under someone who is reading or tabbing through.
    tf.addEventListener('mouseenter', stop);
    tf.addEventListener('mouseleave', start);
    tf.addEventListener('focusin', stop);
    tf.addEventListener('focusout', start);

    // Pause while the section is off screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => (entry.isIntersecting ? start() : stop()));
      }, { threshold: 0.25 }).observe(tf);
    }

    show(0);
    start();
  }

  /* ---------------------------------------------------------
     Bookings: prefill from ?gown= / ?collection= / studio selections
  --------------------------------------------------------- */
  const notes = document.querySelector('#notes');
  if (notes && window.location.search) {
    const q = new URLSearchParams(window.location.search);
    const gown = q.get('gown');
    const collection = q.get('collection');
    const order = q.get('order') === '1';
    if (collection && !gown) {
      notes.value = order
        ? `I'd like to book a live band from ${collection}. Please send availability and full stage rider options.`
        : `I'd love to explore live bands in ${collection}.`;
    }
    if (gown) {
      const bits = [order ? `I'd like to lock in ${gown} for our event date.` : `I'd love to check availability for ${gown}.`];
      if (q.get('fabric')) bits.push(`Lineup: ${q.get('fabric')}.`);
      if (q.get('train')) bits.push(`Performance Sets: ${q.get('train')}.`);
      if (q.get('tone')) bits.push(`Lighting Mood: ${q.get('tone')}.`);
      if (q.get('veil') === 'yes') bits.push('Please include the Pro Concert PA & FOH Sound Engineer package.');
      notes.value = bits.join(' ');
    }
  }
});
