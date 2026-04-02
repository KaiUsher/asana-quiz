export function qs(sel) { return document.querySelector(sel); }
export function qsa(sel) { return document.querySelectorAll(sel); }

export function showScreen(id) {
  qsa('.screen').forEach(s => s.classList.remove('active'));
  qs('#' + id).classList.add('active');
}

export function fuzzyMatch(input, target) {
  const norm = s => s.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+pose$/, ''); // "Half Moon Pose" → "Half Moon"
  const a = norm(input), b = norm(target);
  if (a === b) return true;
  // Allow 1-character difference for minor typos
  if (Math.abs(a.length - b.length) > 2) return false;
  return levenshtein(a, b) <= 1;
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
