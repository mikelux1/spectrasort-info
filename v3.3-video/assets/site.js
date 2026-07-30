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
})();
