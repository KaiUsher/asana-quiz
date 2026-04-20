import { POSES }        from './poses.js';
import { shuffle }      from './quiz.js';
import { showPoseCard } from './overlay.js';
import { qs }           from './utils.js';

let _selectedCategory = null;

export function renderDiceScreen() {
  _selectedCategory = null;
  renderDiceCategoryPills();
  qs('#dice-results').hidden = true;
  qs('#dice-results-list').innerHTML = '';
  // Reset button to primary state
  const btn = qs('#dice-roll-btn');
  btn.className = 'btn-primary btn-ember dice-roll-btn';
  btn.textContent = 'Draw Poses';
  // Collapse the filter panel on screen entry
  qs('#dice-settings-panel').classList.remove('open');
  qs('#dice-settings-toggle').classList.remove('open');
}

export function renderDiceCategoryPills() {
  const categories = ['All', ...new Set(POSES.map(p => p.category))];
  const container  = qs('#dice-category-pills');
  container.innerHTML = '';

  categories.forEach(cat => {
    const isAll    = cat === 'All';
    const isActive = isAll ? _selectedCategory === null : _selectedCategory === cat;
    const btn      = document.createElement('button');
    btn.className  = 'category-pill' + (isActive ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      _selectedCategory = isAll ? null : cat;
      renderDiceCategoryPills();
    });
    container.appendChild(btn);
  });
}

export function rollDice(count) {
  const pool = _selectedCategory
    ? POSES.filter(p => p.category === _selectedCategory)
    : POSES;
  const n      = Math.min(Math.max(1, count), pool.length);
  const rolled = shuffle(pool).slice(0, n);

  const list = qs('#dice-results-list');
  list.innerHTML = '';

  rolled.forEach(pose => {
    const row      = document.createElement('div');
    row.className  = 'glossary-row';
    row.innerHTML  = `
      <span class="glossary-english">${pose.english}</span>
      <span class="glossary-sanskrit">${pose.sanskrit}</span>
    `;
    row.addEventListener('click', () => showPoseCard(pose, rolled));
    list.appendChild(row);
  });

  qs('#dice-results-label').textContent = `${n} pose${n === 1 ? '' : 's'}`;
  qs('#dice-results').hidden = false;

  // Transition button to secondary state after first draw
  const btn = qs('#dice-roll-btn');
  btn.className = 'btn-ghost dice-roll-btn';
  btn.textContent = 'Redraw';
}
