// Stable per-id breath speed; wall-clock phase so DOM rebuilds don't hitch.
// `baseDurationSec` + `spanSec` set the duration range (e.g. 3.4 + 0.6 → 3.4–3.99s).
export function breathTiming(id, baseDurationSec, spanSec) {
  const key = typeof id === 'string' ? id : '';
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash >>>= 0;
  const spanMs = Math.round(spanSec * 1000);
  const durationSec = baseDurationSec + (hash % spanMs) / 1000;
  const phaseOffsetSec = (((hash >>> 8) % 1000) / 1000) * durationSec;
  const delaySec = -((Date.now() / 1000 + phaseOffsetSec) % durationSec);
  return { durationSec, delaySec };
}
