/* SpectraSort site v3.1 — interactions.
   All lifted from Concept C: the rank demo, scroll reveal, the dedupe stack
   collapse, and the sticky mobile CTA. No analytics yet (added at promote time,
   same Firebase snippet as the v3 draft). */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- rank demo: same nine photos, re-ranked per question ---------- */
  var ART = [
    'images/art/subject-nature.jpg',
    'images/art/subject-portrait.jpg',
    'images/art/subject-night.jpg',
    'images/art/subject-street.jpg',
    'images/art/subject-food.jpg',
    'images/art/subject-architecture.jpg',
    'images/art/subject-pets.jpg',
    'images/art/subject-sunset.jpg',
    'images/art/profile-versatile.jpg'
  ];
  var SCORES = {
    taste: [9.4, 9.1, 8.8, 8.2, 7.9, 7.1, 6.4, 5.8, 5.1],
    best:  [9.6, 9.2, 8.9, 8.5, 7.8, 7.2, 6.8, 6.1, 5.5]
  };
  var ORDERS = {
    taste:  [2, 0, 5, 1, 7, 3, 8, 4, 6],
    best:   [4, 6, 1, 8, 0, 2, 3, 7, 5],
    search: [7, 2, 8, 0, 1, 3, 4, 5, 6]
  };
  var SEARCH_MATCH = [7, 2, 8];              // sunset / night / versatile read as "golden hour"
  var CAPTIONS = {
    taste:  'ranked by the photos you keep',
    best:   'ranked by sharpness, exposure, composition',
    search: 'matches first — still ranked, not just found'
  };

  var grid = document.getElementById('demoGrid');
  var capEl = document.getElementById('rankCaption');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.dchip'));
  var tiles = [];
  var userTouched = false;

  function slotPos(slot) {
    var col = slot % 3, row = Math.floor(slot / 3);
    return { x: 'calc(' + col + ' * (100% + 8px))', y: 'calc(' + row + ' * (100% + 8px))' };
  }

  function applyMode(mode) {
    ORDERS[mode].forEach(function (tileIdx, slot) {
      var t = tiles[tileIdx];
      if (!t) return;
      var p = slotPos(slot);
      t.style.transform = 'translate(' + p.x + ',' + p.y + ')';
      var sc = t.querySelector('.score');
      if (mode === 'search') {
        var match = SEARCH_MATCH.indexOf(tileIdx) !== -1;
        t.classList.toggle('dim', !match);
        t.classList.toggle('top3', match);
        sc.textContent = match ? '✓ match' : '';
        t.classList.toggle('scored', match);
      } else {
        t.classList.remove('dim');
        t.classList.toggle('top3', slot < 3);
        sc.textContent = SCORES[mode][slot].toFixed(1);
        t.classList.add('scored');
      }
    });
    capEl.textContent = CAPTIONS[mode];
    chips.forEach(function (c) { c.classList.toggle('active', c.dataset.mode === mode); });
  }

  if (grid) {
    ART.forEach(function (src) {
      var d = document.createElement('div');
      d.className = 'rank-tile';
      var img = document.createElement('img');
      img.src = src; img.alt = ''; img.loading = 'lazy';
      d.appendChild(img);
      var s = document.createElement('span');
      s.className = 'score';
      d.appendChild(s);
      grid.appendChild(d);
      tiles.push(d);
    });
    chips.forEach(function (c) {
      c.addEventListener('click', function () { applyMode(c.dataset.mode); userTouched = true; });
    });
    applyMode('taste');
    if (!REDUCED) {
      var seq = ['taste', 'best', 'search'], mi = 0;
      setInterval(function () {
        if (!userTouched) { mi = (mi + 1) % seq.length; applyMode(seq[mi]); }
      }, 3600);
    }
  }

  /* ---------- scroll reveal ---------- */
  var reveal = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
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

  /* ---------- sticky mobile CTA after hero ---------- */
  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');
  if (sticky && hero && 'IntersectionObserver' in window) {
    var ho = new IntersectionObserver(function (es) {
      es.forEach(function (e) { sticky.classList.toggle('show', !e.isIntersecting); });
    }, { threshold: 0.1 });
    ho.observe(hero);
  }
})();
