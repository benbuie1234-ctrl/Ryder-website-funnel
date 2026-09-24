/**
 * checkout.js — Ryder Cragun Demo Checkout
 *
 * - Parses ?tier=R1|R2|R3 from URL; defaults to R2.
 * - All price calculations use integer cents.
 * - No network requests, no storage reads/writes.
 * - No Stripe or any payment SDK.
 * - Demo confirmation only — no real transaction.
 */

'use strict';

/* ── TIER DATA ──────────────────────────────────────────── */

/** Price values stored in integer cents to avoid floating-point errors. */
const TIERS = {
  R1: {
    id:         'R1',
    name:       'Basic',
    priceCents: 2500,          // $25.00
    recommended: false,
    apex:       false,
    audience:   'For athletes building a solid bench press foundation.',
    features: [
      'Full bench press program',
    ],
  },
  R2: {
    id:         'R2',
    name:       'Plus',
    priceCents: 4000,          // $40.00
    recommended: true,
    apex:       false,
    audience:   'For athletes who want video coaching alongside the program.',
    features: [
      'Full bench press program',
      'Wrap tutorial video',
      'Form tutorial video',
    ],
  },
  R3: {
    id:         'R3',
    name:       'Apex',
    priceCents: 10000,         // $100.00
    recommended: false,
    apex:       true,
    audience:   'For athletes who want direct access to Ryder.',
    features: [
      'Full bench press program',
      'Wrap tutorial video',
      'Form tutorial video',
      'Two coaching calls per week',
      'Snapchat DM access',
    ],
  },
};

/** Allowlist of valid tier query param values. */
const VALID_TIERS = new Set(['R1', 'R2', 'R3']);

/* ── UTILITY ────────────────────────────────────────────── */

/**
 * Format an integer cent value to a USD price string.
 * @param {number} cents  Integer cents (e.g. 4000 → "$40.00")
 * @returns {string}
 */
function formatCents(cents) {
  // Whole-dollar amounts: display without decimal for cleanliness
  if (cents % 100 === 0) {
    return '$' + (cents / 100).toFixed(0);
  }
  return '$' + (cents / 100).toFixed(2);
}

/**
 * Create an SVG check icon element.
 * @returns {SVGElement}
 */
function makeCheckIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('tdp-check');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M3 8.5l3.5 3.5 6.5-7');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  return svg;
}

/* ── DOM REFS ───────────────────────────────────────────── */

const tierRadios      = document.querySelectorAll('input[name="tier"]');
const tierDetailPanel = document.getElementById('tier-detail-panel');
const priceSubtotal   = document.getElementById('price-subtotal');
const priceTotal      = document.getElementById('price-total');
const priceProgramLbl = document.getElementById('price-program-label');
const simulateBtn     = document.getElementById('simulate-btn');
const simulateBtnText = document.getElementById('simulate-btn-text');
const statusRegion    = document.getElementById('status-region');
const apexNotice      = document.getElementById('apex-notice');

const overlay           = document.getElementById('overlay');
const confirmDialog     = document.getElementById('confirm-dialog');
const confirmSummary    = document.getElementById('confirm-summary');
const overlayCloseBtn   = document.getElementById('overlay-close-btn');
const tryAnotherBtn     = document.getElementById('try-another-btn');

/* ── FOCUS TRAP STATE ───────────────────────────────────── */

/** The element to return focus to when the overlay closes. */
let focusReturnTarget = null;

/** Body children (except overlay) that were made inert on open. */
let inertedElements = [];

/* ── TIER MANAGEMENT ────────────────────────────────────── */

/**
 * Return the tier key parsed from ?tier= query param,
 * validated against allowlist, defaulting to 'R2'.
 * @returns {'R1'|'R2'|'R3'}
 */
function parseTierFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('tier') || '').toUpperCase();
    return VALID_TIERS.has(raw) ? raw : 'R2';
  } catch {
    return 'R2';
  }
}

/**
 * Return the currently checked tier key, or null.
 * @returns {string|null}
 */
function getCheckedTier() {
  for (const radio of tierRadios) {
    if (radio.checked) return radio.value;
  }
  return null;
}

/**
 * Set the active tier radio by key without triggering native change events.
 * @param {string} tierKey
 */
function setTierRadio(tierKey) {
  for (const radio of tierRadios) {
    radio.checked = (radio.value === tierKey);
  }
}

/**
 * Render the tier detail panel and price breakdown for the given tier.
 * @param {object} tier  One of the TIERS entries.
 */
function renderTierDetail(tier) {
  // -- Tier detail panel
  const frag = document.createDocumentFragment();

  const nameEl = document.createElement('p');
  nameEl.className = 'tdp-name';
  nameEl.textContent = tier.name;
  frag.appendChild(nameEl);

  const audienceEl = document.createElement('p');
  audienceEl.className = 'tdp-audience';
  audienceEl.textContent = tier.audience;
  frag.appendChild(audienceEl);

  const featuresList = document.createElement('ul');
  featuresList.className = 'tdp-features';
  featuresList.setAttribute('aria-label', tier.name + ' program includes');

  for (const feat of tier.features) {
    const li = document.createElement('li');
    li.className = 'tdp-feature';
    li.appendChild(makeCheckIcon());
    const span = document.createElement('span');
    span.textContent = feat;
    li.appendChild(span);
    featuresList.appendChild(li);
  }

  frag.appendChild(featuresList);

  tierDetailPanel.innerHTML = '';
  tierDetailPanel.appendChild(frag);

  // -- Price breakdown
  const formatted = formatCents(tier.priceCents);
  priceProgramLbl.textContent = tier.name + ' Program';
  priceSubtotal.textContent   = formatted;
  priceTotal.textContent      = formatted;

  // -- Simulate button label
  simulateBtnText.textContent = 'Simulate Purchase — ' + formatted;

  // -- Apex notice
  if (tier.apex) {
    apexNotice.removeAttribute('hidden');
  } else {
    apexNotice.setAttribute('hidden', '');
  }
}

/* ── CONFIRMATION OVERLAY ───────────────────────────────── */

/**
 * Build and display the confirmation overlay for the given tier.
 * @param {object} tier
 */
function openConfirmation(tier) {
  const formatted = formatCents(tier.priceCents);

  // Build summary HTML
  const frag = document.createDocumentFragment();

  function makeRow(label, value, isTotal = false) {
    const row = document.createElement('div');
    row.className = isTotal ? 'cs-row cs-row--total' : 'cs-row';

    const lbl = document.createElement('span');
    lbl.className = 'cs-label';
    lbl.textContent = label;

    const val = document.createElement('span');
    val.className = isTotal ? 'cs-total-value' : 'cs-value';
    val.textContent = value;

    row.appendChild(lbl);
    row.appendChild(val);
    return row;
  }

  frag.appendChild(makeRow('Program', tier.id + ' ' + tier.name));
  frag.appendChild(makeRow('Demo customer', 'Alex Demo'));
  frag.appendChild(makeRow('Demo card', '•••• •••• •••• 4242'));

  const div = document.createElement('div');
  div.className = 'cs-divider';
  div.setAttribute('aria-hidden', 'true');
  frag.appendChild(div);

  frag.appendChild(makeRow('Total (demo)', formatted, true));

  if (tier.apex) {
    const apexRow = document.createElement('p');
    apexRow.style.cssText = 'font-size:0.75rem;color:rgba(243,240,232,0.5);margin-top:0.75rem;line-height:1.5;';
    apexRow.textContent = 'Apex coaching duration unspecified — confirm details with Ryder before any real purchase.';
    frag.appendChild(apexRow);
  }

  confirmSummary.innerHTML = '';
  confirmSummary.appendChild(frag);

  // Show overlay
  overlay.removeAttribute('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  focusReturnTarget = document.activeElement;

  // Make all sibling body children inert so background is unreachable
  inertedElements = Array.from(document.body.children).filter(el => el !== overlay);
  for (const el of inertedElements) {
    el.inert = true;
  }

  // Defer focus so hidden→visible paint occurs first
  requestAnimationFrame(() => {
    confirmDialog.focus();
  });

  // Status announcement
  announceStatus('Demo purchase simulated for ' + tier.name + ' at ' + formatted + '. No real payment was made.');
}

/** Close the confirmation overlay and restore focus. */
function closeConfirmation() {
  overlay.setAttribute('hidden', '');
  overlay.setAttribute('aria-hidden', 'true');

  // Restore background elements
  for (const el of inertedElements) {
    el.inert = false;
  }
  inertedElements = [];

  if (focusReturnTarget && typeof focusReturnTarget.focus === 'function') {
    focusReturnTarget.focus();
  }
  focusReturnTarget = null;

  announceStatus('');
}

/* ── STATUS ANNOUNCEMENTS ───────────────────────────────── */

/**
 * Post a message to the ARIA live status region.
 * @param {string} msg
 */
function announceStatus(msg) {
  // Clear then set to ensure re-announcement for identical strings
  statusRegion.textContent = '';
  if (msg) {
    // Small delay ensures screen reader re-reads
    setTimeout(() => { statusRegion.textContent = msg; }, 80);
  }
}

/* ── EVENT HANDLERS ─────────────────────────────────────── */

/** Handle tier radio changes. */
function onTierChange() {
  const key = getCheckedTier();
  if (!key || !TIERS[key]) return;
  renderTierDetail(TIERS[key]);
  announceStatus(TIERS[key].name + ' selected — ' + formatCents(TIERS[key].priceCents));
}

/** Handle Simulate Purchase click. */
function onSimulateClick() {
  const key = getCheckedTier();
  if (!key || !TIERS[key]) return;
  openConfirmation(TIERS[key]);
}

/** Handle overlay close button. */
function onOverlayClose() {
  closeConfirmation();
}

/** Handle Try Another Tier button. */
function onTryAnother() {
  closeConfirmation();
}

/**
 * Keyboard handler for the overlay — Escape to close,
 * Tab to trap focus within the dialog.
 * @param {KeyboardEvent} e
 */
function onOverlayKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeConfirmation();
    return;
  }

  if (e.key === 'Tab') {
    const focusable = Array.from(
      confirmDialog.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));

    if (!focusable.length) { e.preventDefault(); return; }

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Also trap when the dialog container itself is focused (initial state)
      if (document.activeElement === first || document.activeElement === confirmDialog) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || document.activeElement === confirmDialog) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

/* ── INIT ───────────────────────────────────────────────── */

function init() {
  // 1. Read tier from URL, set radio
  const urlTier = parseTierFromURL();
  setTierRadio(urlTier);

  // 2. Render initial state
  renderTierDetail(TIERS[urlTier]);

  // 3. Attach tier radio listeners
  for (const radio of tierRadios) {
    radio.addEventListener('change', onTierChange);
  }

  // 4. Simulate button
  simulateBtn.addEventListener('click', onSimulateClick);

  // 5. Overlay controls
  overlayCloseBtn.addEventListener('click', onOverlayClose);
  tryAnotherBtn.addEventListener('click', onTryAnother);

  // 6. Overlay keyboard trap + Escape
  overlay.addEventListener('keydown', onOverlayKeydown);

  // 7. Click outside dialog to close
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeConfirmation();
  });
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
