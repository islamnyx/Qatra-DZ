/**
 * Northern edge of a polygon ring (Morocco–Western Sahara separator).
 */
export function extractNorthernBoundaryLine(ring) {
  if (!ring?.length || ring.length < 3) return null;

  const maxLat = Math.max(...ring.map((p) => p[1]));
  const threshold = maxLat - 0.08;
  const n = ring.length;

  const segments = [];
  let current = [];

  const flush = () => {
    if (current.length > 1) segments.push([...current]);
    current = [];
  };

  for (let i = 0; i < n; i++) {
    const p = ring[i];
    if (p[1] >= threshold) current.push(p);
    else flush();
  }
  flush();

  if (ring[0][1] >= threshold && ring[n - 1][1] >= threshold && segments.length >= 2) {
    const first = segments[0];
    const last = segments[segments.length - 1];
    segments[segments.length - 1] = [...last, ...first];
    segments.shift();
  } else if (current.length > 1) {
    segments.push(current);
  }

  let best = segments[0] ?? [];
  for (const seg of segments) {
    if (seg.length > best.length) best = seg;
  }
  if (best.length < 2) return null;

  const deduped = dedupeConsecutive(best);
  deduped.sort((a, b) => a[0] - b[0]);
  return deduped.length >= 2 ? deduped : null;
}

function dedupeConsecutive(coords) {
  const out = [];
  for (const p of coords) {
    const prev = out[out.length - 1];
    if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) out.push(p);
  }
  return out;
}
