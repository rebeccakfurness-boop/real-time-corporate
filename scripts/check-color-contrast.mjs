#!/usr/bin/env node
/**
 * Verifies the Realtime brand's approved foreground/background pairings meet their
 * declared WCAG contrast ratios. This is the enforcement mechanism referenced in
 * DESIGN_TOKENS.md: run in CI (see package.json "check:contrast") so a future edit to a
 * token hex value that breaks an approved pairing fails the build instead of shipping.
 *
 * This checks the *approved pairing list*, not arbitrary className combinations in JSX —
 * see DESIGN_TOKENS.md "Scope of this check" for why, and what a stricter version would
 * require.
 */

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

// [foreground, background, minimum ratio, label]
const APPROVED_PAIRINGS = [
  ['#141C2E', '#F6F7FB', 7.0, 'Text on Background — all sizes (AAA)'],
  ['#6F7A8A', '#F6F7FB', 3.0, 'Muted on Background — large text/UI only'],
  ['#4C5BD4', '#F6F7FB', 4.5, 'Primary on Background — all sizes'],
  ['#FFFFFF', '#4C5BD4', 4.5, 'White on Primary — all sizes'],
  ['#FFFFFF', '#7A8BFF', 3.0, 'White on Schools-light-base — large text only, Corporate hover states only'],
  ['#141C2E', '#22D3C5', 4.5, 'Text on Teal — all sizes'],
];

let failed = false;
console.log('Realtime brand — approved contrast pairings\n');
for (const [fg, bg, min, label] of APPROVED_PAIRINGS) {
  const ratio = contrastRatio(fg, bg);
  const pass = ratio >= min;
  if (!pass) failed = true;
  console.log(
    `${pass ? '✓' : '✗ FAIL'}  ${fg} on ${bg}  →  ${ratio.toFixed(2)}:1  (needs ≥ ${min}:1)  — ${label}`
  );
}

if (failed) {
  console.error('\nOne or more approved pairings no longer meet their declared contrast ratio.');
  process.exit(1);
}
console.log('\nAll approved pairings pass.');
