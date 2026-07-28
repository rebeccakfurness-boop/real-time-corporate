/**
 * Deterministic, fun display handle for a Person id — used anywhere a leader-facing view
 * would otherwise show an employee's real name (e.g. challenge leaderboards). Same person
 * always gets the same handle within a session/render, with no way to reverse it back to
 * an identity — it's derived from the id, not stored.
 */

const ADJECTIVES = [
  'Kōwhai', 'Swift', 'Bright', 'Calm', 'Bold', 'Sunny', 'Steady', 'Vivid', 'Golden', 'Quiet',
  'Coastal', 'Alpine', 'Amber', 'Cheerful', 'Resolute', 'Gentle',
];
const NOUNS = [
  'Kiwi', 'Tūī', 'Falcon', 'Dolphin', 'Kauri', 'Harbour', 'Fern', 'Comet', 'Summit', 'Otter',
  'Pōhutukawa', 'Glacier', 'Heron', 'Lighthouse', 'Meadow', 'Ridge',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pseudonymFor(personId: string): string {
  const hash = hashString(personId);
  const adjective = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(hash / ADJECTIVES.length) % NOUNS.length];
  const suffix = hash % 100;
  return `${adjective} ${noun} #${suffix}`;
}
