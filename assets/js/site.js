/* Experis for CollegeBuys — motion + navigation.
   One load sequence (headline, then the desk), scroll-spy for the pill nav,
   a progress line down the reading path, count-ups on the research figures,
   pointer tilt on covers. Everything degrades to static under reduced motion
   or if GSAP fails to load. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function showStatic() {
    $$('[data-hero]').forEach(function (el) { el.style.opacity = 1; });
    $$('.sheet').forEach(function (el) { el.style.opacity = 1; });
    $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  /* ---------- header: compact pill after the first scroll ---------- */
  var header = $('[data-header]');
  function onScrollHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- scroll-spy: move the ink under the current section ---------- */
  var nav = $('.nav');
  var ink = $('.nav-ink');
  var links = $$('[data-spy]');
  var sections = links.map(function (a) { return document.getElementById(a.dataset.spy); }).filter(Boolean);
  function setInk(a) {
    if (!ink || !nav) return;
    if (!a) { ink.style.setProperty('--o', 0); return; }
    var r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
    ink.style.setProperty('--x', (r.left - n.left + 12) + 'px');
    ink.style.setProperty('--w', (r.width - 24) + 'px');
    ink.style.setProperty('--o', 1);
  }
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    var last = sections[sections.length - 1];
    if (last && window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) current = last;
    links.forEach(function (a) { a.classList.toggle('is-active', current && a.dataset.spy === current.id); });
    setInk(current ? links.filter(function (a) { return a.dataset.spy === current.id; })[0] : null);
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ---------- reading path: which step has the reader passed ---------- */
  var docs = $$('.doc');
  function pathState() {
    var mid = window.innerHeight * 0.5;
    docs.forEach(function (d) { d.classList.toggle('is-past', d.getBoundingClientRect().top < mid); });
  }
  window.addEventListener('scroll', pathState, { passive: true });
  pathState();

  if (reduced || !hasGsap) { showStatic(); if (!hasGsap && !reduced) { /* no GSAP: still draw the path line on scroll */ drawPathFallback(); } return; }

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- the one orchestrated moment: page load ---------- */
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  gsap.set('[data-hero="1"]', { y: 28, clipPath: 'inset(0 0 100% 0)' });
  tl.to('[data-hero="0"]', { opacity: 1, duration: .6 }, 0)
    .to('[data-hero="1"]', { opacity: 1, y: 0, clipPath: 'inset(0 0 -10% 0)', duration: 1.2, clearProps: 'clipPath' }, .05)
    .to('[data-hero="4"], [data-hero="5"]', { opacity: 1, y: 0, duration: .9, stagger: .1 }, .5)
    .fromTo('.sheet', { opacity: 0, y: 70, rotation: function (i, el) { return parseFloat(getComputedStyle(el).getPropertyValue('--rot')) + 8; } },
                     { opacity: 1, y: 0, rotation: function (i, el) { return parseFloat(getComputedStyle(el).getPropertyValue('--rot')); }, duration: 1.3, stagger: { each: .07, from: 'start' }, clearProps: 'rotation,y' }, .25)
    .to('[data-hero="6"]', { opacity: 1, duration: .8 }, .9);
  gsap.set('[data-hero="4"], [data-hero="5"]', { y: 14 });

  /* ---------- reading path: blue line grows with scroll ---------- */
  var path = $('[data-path]');
  if (path) {
    ScrollTrigger.create({ trigger: path, start: 'top 55%', end: 'bottom 55%', scrub: true,
      onUpdate: function (st) { path.style.setProperty('--p', st.progress.toFixed(4)); } });
  }

  /* ---------- count-ups ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
    var state = { v: 0 };
    el.textContent = '0' + suffix;
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: function () { gsap.to(state, { v: target, duration: 1.4, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(state.v) + suffix; } }); } });
  });

  /* ---------- photo: slow parallax ---------- */
  $$('[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- covers: pointer tilt (answers the reader's hand, not the scroll) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-tilt]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'rotationY', { duration: .5, ease: 'power3.out' });
      var qy = gsap.quickTo(el, 'rotationX', { duration: .5, ease: 'power3.out' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        qx(px * 10); qy(-py * 10);
      });
      el.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  /* ---------- desk: sheets drift apart slightly as the hero scrolls away ---------- */
  $$('.sheet').forEach(function (el, i) {
    gsap.to(el, { y: -(10 + (i % 3) * 8), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  document.fonts && document.fonts.ready && document.fonts.ready.then(function () { ScrollTrigger.refresh(); spy(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); spy(); });

  function drawPathFallback() {
    var p = $('[data-path]'); if (!p) return;
    function upd() {
      var r = p.getBoundingClientRect(), mid = window.innerHeight * .55;
      var prog = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      p.style.setProperty('--p', prog.toFixed(4));
    }
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }
})();

/* ---------- practice areas: segmented tabs (works without GSAP) ---------- */
(function () {
  var root = document.querySelector('[data-practices]'); if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var ink = root.querySelector('.seg-ink');
  var seg = root.querySelector('.seg');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function place(tab) {
    if (!ink) return;
    var r = tab.getBoundingClientRect(), s = seg.getBoundingClientRect();
    ink.style.setProperty('--x', (r.left - s.left) + 'px'); ink.style.setProperty('--y', (r.bottom - s.top - 1) + 'px');
    ink.style.setProperty('--w', r.width + 'px');
  }
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
        if (on && !reduced && window.gsap) {
          window.gsap.fromTo(panel.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .45, stagger: .04, ease: 'power3.out', overwrite: true });
        }
      }
    });
    place(tab); if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return; e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
  var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
  place(current);
  window.addEventListener('resize', function () { place(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]); });
  document.fonts && document.fonts.ready && document.fonts.ready.then(function () { place(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]); });

  /* pillars: top rule draws in once, when the section arrives */
  var pillars = Array.prototype.slice.call(document.querySelectorAll('.pillar'));
  if ('IntersectionObserver' in window && pillars.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { var i = pillars.indexOf(en.target); setTimeout(function () { en.target.classList.add('is-in'); }, reduced ? 0 : i * 120); io.unobserve(en.target); } });
    }, { threshold: .35 });
    pillars.forEach(function (p) { io.observe(p); });
  } else { pillars.forEach(function (p) { p.classList.add('is-in'); }); }
})();
