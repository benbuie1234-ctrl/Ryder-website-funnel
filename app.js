'use strict';

/* ── Copy-code buttons ── */
var copyTimers = new WeakMap();
var announcer = document.getElementById('copy-announce');

document.querySelectorAll('.copy-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var code = btn.dataset.code;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(function () { showCopied(btn, true); })
        .catch(function () { fallbackCopy(code, btn); });
    } else {
      fallbackCopy(code, btn);
    }
  });
});

function fallbackCopy(text, btn) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  var success = false;
  try { success = document.execCommand('copy'); } catch (e) { success = false; }
  document.body.removeChild(ta);
  if (success) {
    showCopied(btn, true);
  } else {
    showCopied(btn, false);
  }
  btn.focus();
}

function showCopied(btn, success) {
  var original = btn.textContent;
  var originalLabel = btn.getAttribute('aria-label');

  /* reset any running timer for this button */
  if (copyTimers.has(btn)) {
    clearTimeout(copyTimers.get(btn));
  }

  if (success) {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    btn.setAttribute('aria-label', 'Code copied to clipboard');
    if (announcer) announcer.textContent = btn.dataset.code + ' copied to clipboard.';
  } else {
    btn.textContent = 'Failed';
    btn.setAttribute('aria-label', 'Copy failed — please copy manually');
    if (announcer) announcer.textContent = 'Copy failed. Please copy the code manually.';
  }

  var timer = setTimeout(function () {
    btn.textContent = original;
    btn.classList.remove('copied');
    btn.setAttribute('aria-label', originalLabel);
    if (announcer) announcer.textContent = '';
    copyTimers.delete(btn);
    btn.focus();
  }, 1800);
  copyTimers.set(btn, timer);
}

/* ── Smooth anchor scroll with sticky-nav offset ── */
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var id = link.getAttribute('href');
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var nav = document.querySelector('.site-nav');
    var navH = nav ? nav.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
    if (prefersReducedMotion) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

/* ── FAQ keyboard support ── */
document.querySelectorAll('.faq-item summary').forEach(function (summary) {
  summary.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var details = summary.closest('details');
      if (details) details.open = !details.open;
    }
  });
});
