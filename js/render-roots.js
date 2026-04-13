import { INSIGHTS, getRootsSeenIds } from './insights.js';
import { showInsightCard }           from './render-results.js';
import { qs, showScreen }            from './utils.js';

export function renderRoots() {
  const seen  = getRootsSeenIds();
  const total = INSIGHTS.length;
  const count = INSIGHTS.filter(i => seen.has(i.id)).length;

  qs('#roots-count').textContent = `${count} / ${total} Discovered`;

  const hint = qs('#roots-hint');
  hint.textContent = count < total ? 'Unlocked through practice.' : 'Collection complete.';
  hint.style.display = '';

  const grid = qs('#roots-grid');
  grid.innerHTML = '';
  INSIGHTS.forEach(insight => {
    const tile = document.createElement('div');
    if (seen.has(insight.id)) {
      tile.className = 'roots-tile roots-tile--unlocked';
      tile.innerHTML = `<span class="roots-tile-root">${insight.root}</span><span class="roots-tile-meaning">${insight.meaning}</span>`;
      tile.addEventListener('click', () => showInsightCard(insight, renderRoots));
    } else {
      tile.className = 'roots-tile roots-tile--locked';
      tile.innerHTML = `<span class="roots-tile-lock">?</span>`;
    }
    grid.appendChild(tile);
  });

  showScreen('screen-roots');
}
