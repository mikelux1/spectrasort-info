/* SpectraSort site v3.3-video — interactions.
   Lifted from Concept C: scroll reveal, the dedupe stack collapse, and the
   sticky mobile CTA. Analytics live in assets/analytics.js,
   loaded separately as a module so a blocked Firebase CDN can never take the
   page's interactions down with it.
   v3.3 adds the screen-loop playback gate at the bottom. */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The rank demo was removed with the "Why not just search?" section on
     2026-07-29. Its CSS (.demo-phone / .rank-grid / .rank-tile / .dchip) is left in
     site.css so restoring it is markup + this block again; see git history. */

  /* ---------- scroll reveal ---------- */
  var reveal = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    /* threshold 0, not 0.15: a block taller than the viewport (the changelog's
       release list is ~6,700px) can never show 15% of itself, so it used to
       stay at opacity 0 forever. Any pixel entering the viewport reveals it. */
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(reveal, function (el) { ro.observe(el); });
  } else {
    Array.prototype.forEach.call(reveal, function (el) { el.classList.add('in'); });
  }

  /* ---------- dedupe stack collapse ---------- */
  var stack = document.getElementById('stackDemo');
  if (stack && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        setTimeout(function () { stack.classList.add('collapsed'); }, 700);
        if (!REDUCED) {
          setInterval(function () {
            stack.classList.remove('collapsed');
            setTimeout(function () { stack.classList.add('collapsed'); }, 1200);
          }, 5200);
        }
        so.unobserve(stack);
      });
    }, { threshold: 0.5 });
    so.observe(stack);
  }

  /* ---------- screen loops (v3.3) ----------
     No `autoplay` attribute in the markup on purpose. Three of these on one page
     is real CPU and battery, so playback is driven from here instead:
       - prefers-reduced-motion  -> never played. The poster is the whole
                                    experience, and every poster is a legible,
                                    informative frame, not a black one.
       - otherwise               -> play on entering view, PAUSE on leaving, so
                                    at most one loop is ever decoding.
     Matches how the dedupe stack collapse already gates itself. */
  var loops = document.querySelectorAll('video.screen-loop');
  if (loops.length && !REDUCED) {
    var playSafe = function (v) { var p = v.play(); if (p && p.catch) { p.catch(function () {}); } };
    if ('IntersectionObserver' in window) {
      var vo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { playSafe(e.target); } else { e.target.pause(); }
        });
      }, { threshold: 0.25 });
      Array.prototype.forEach.call(loops, function (v) { vo.observe(v); });
    } else {
      Array.prototype.forEach.call(loops, playSafe);
    }
  }

  /* ---------- sticky mobile CTA after hero ---------- */
  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    var ho = new IntersectionObserver(function (es) {
      es.forEach(function (e) { sticky.classList.toggle('show', !e.isIntersecting); });
    }, { threshold: 0.1 });
    ho.observe(hero);
  }

  /* ---------- storefront-aware App Store links + campaign codes ----------
     Every English page hard-codes the US App Store URL. Rewrite it from the
     browser language so a French visitor lands on the French listing. The
     static href stays in the HTML for crawlers and no-JS visitors.

     `ct` is derived from the page path. `pt` is the provider token from App
     Store Connect; a ct without pt is not attributed, so leave PT empty until
     the token is pasted here. A link can override either with data-ct or
     data-store. Absolute /fr/ or /cn/ links are left alone. */
  var ASC_PT = ''; /* paste the App Store Connect provider token here */
  var STORE_BY_LANG = {
    'en-gb': 'gb', 'en-ca': 'ca', 'en-au': 'au',
    'fr': 'fr', 'de': 'de', 'it': 'it', 'es': 'es',
    'pt-br': 'br', 'pt': 'pt', 'nl': 'nl'
  };
  var CT_BY_PATH = {
    '/': 'web_home',
    '/ai-photo-picker-iphone/': 'web_aipicker',
    '/photo-culling-iphone/': 'web_culling',
    '/best-photo-picker/': 'web_bestpicker',
    '/find-best-photos-iphone/': 'web_findbest',
    '/duplicate-photo-finder-iphone/': 'web_dupe',
    '/photo-organizer-iphone/': 'web_organizer',
    '/private-ai-photo-app/': 'web_privacy',
    '/ai-photo-organizer-vs-apple-photos/': 'web_vs_apple',
    '/spectrasort-vs-google-photos/': 'web_vs_google',
    '/ai-photo-picker-vs-photo-culling/': 'web_picker_vs_culling',
    '/how-to-pick-best-photos-from-camera-roll/': 'web_camera_roll',
    '/vacation-photos-iphone/': 'web_vacation',
    '/features/': 'web_features',
    '/pricing/': 'web_pricing',
    '/studio/': 'web_studio',
    '/changelog/': 'web_changelog',
    '/documents-receipts-iphone/': 'web_documents',
    '/press/': 'web_press',
    '/slidebox-alternative/': 'web_slidebox_alt',
    '/swipewipe-alternative/': 'web_swipewipe_alt'
  };
  function storefrontFor(lang) {
    if (!lang) return 'us';
    lang = String(lang).toLowerCase();
    if (STORE_BY_LANG[lang]) return STORE_BY_LANG[lang];
    var base = lang.split('-')[0];
    return STORE_BY_LANG[base] || 'us';
  }
  /* A page under /fr/, /de/, /it/, /es/ or /pt/ must point at that country's
     listing even when the browser is set to English. The path wins over the
     browser language; data-store still wins over both. */
  var STORE_BY_PREFIX = { 'fr': 'fr', 'de': 'de', 'it': 'it', 'es': 'es', 'pt': 'br' };
  function storefrontForPath(path) {
    var m = /^\/(fr|de|it|es|pt)(?:\/|$)/.exec(path);
    return m ? STORE_BY_PREFIX[m[1]] : null;
  }
  function stripLang(path) {
    return path.replace(/^\/(fr|de|it|es|pt)(?=\/|$)/, '') || '/';
  }
  function campaignFor(path) {
    if (CT_BY_PATH[path]) return CT_BY_PATH[path];
    var slug = path.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '_');
    return slug ? 'web_' + slug : 'web_home';
  }
  function rewriteStoreLinks() {
    var store = storefrontForPath(location.pathname) ||
                storefrontFor((navigator.languages && navigator.languages[0]) || navigator.language);
    var ct = campaignFor(stripLang(location.pathname));
    var links = document.querySelectorAll('a[href*="apps.apple.com/us/app/"]');
    Array.prototype.forEach.call(links, function (a) {
      var thisStore = a.getAttribute('data-store') || store;
      var linkCt = a.getAttribute('data-ct') || ct;
      try {
        var u = new URL(a.href);
        if (u.hostname !== 'apps.apple.com') return;
        if (u.pathname.indexOf('/us/') !== 0) return;
        u.pathname = u.pathname.replace(/^\/us\//, '/' + thisStore + '/');
        u.searchParams.set('ct', linkCt);
        if (ASC_PT) u.searchParams.set('pt', ASC_PT);
        a.href = u.toString();
      } catch (e) { /* leave the static href alone */ }
    });
  }
  rewriteStoreLinks();

  /* ---------- language menu ----------
     <details> opens and closes natively; this only adds the two behaviours
     people expect from a menu: click outside closes it, Escape closes it. */
  var langMenus = document.querySelectorAll('.lang-menu');
  if (langMenus.length) {
    document.addEventListener('click', function (e) {
      Array.prototype.forEach.call(langMenus, function (d) {
        if (d.open && !d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        Array.prototype.forEach.call(langMenus, function (d) { d.open = false; });
      }
    });
    /* Remember an explicit choice. The English homepage sends a stored 'zh'
       reader to /zh/; without this, picking English there would bounce back. */
    Array.prototype.forEach.call(document.querySelectorAll('.lang-menu-panel a, footer .lang-switch a'), function (a) {
      a.addEventListener('click', function () {
        try {
          var code = (a.getAttribute('hreflang') || a.getAttribute('lang') || '').toLowerCase();
          if (code) localStorage.setItem('ss-lang', code.indexOf('zh') === 0 ? 'zh' : code.split('-')[0]);
        } catch (e) {}
      });
    });
  }
})();
