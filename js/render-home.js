import { POSES }          from './poses.js';
import { getStreak }      from './streak.js';
import { getStats }       from './srs.js';
import { ICON_FLAME }     from './icons.js';
import { qs, qsa, showScreen } from './utils.js';

export function renderHome(selectedCategory, selectedLength, checkUpdate, onCategoryChange, onLengthChange) {
  if (checkUpdate?.()) return;
  document.body.classList.remove('dark-bg');
  renderStats();
  renderStreak();
  renderLengthPicker(selectedLength, onLengthChange);
  renderCategoryPills(selectedCategory, onCategoryChange);
  showScreen('screen-home');
}

export function renderStats() {
  const stats         = getStats();
  const total         = stats.total;
  const masteredPct   = stats.masteredCount  / total * 100;
  const practicingPct = (stats.masteredCount + stats.practicingCount) / total * 100;

  qs('#stat-mastered').textContent          = stats.masteredCount;
  qs('#stat-total').textContent             = '\u200a/\u200a' + total;
  qs('#mastery-bar-mastered').style.width   = masteredPct + '%';
  qs('#mastery-bar-practicing').style.width = practicingPct + '%';

  const sub = qs('#mastery-sub');
  if (stats.dueCount > 0) {
    sub.textContent = stats.dueCount + ' pose' + (stats.dueCount > 1 ? 's' : '') + ' due for review';
    sub.className   = 'mastery-sub has-due';
  } else if (stats.practicingCount > 0) {
    sub.textContent = stats.practicingCount + ' in progress';
    sub.className   = 'mastery-sub';
  } else if (stats.masteredCount === total) {
    sub.textContent = 'All poses mastered.';
    sub.className   = 'mastery-sub';
  } else {
    sub.textContent = '';
    sub.className   = 'mastery-sub';
  }
}

export function renderStreak() {
  const streak = getStreak();
  const el     = qs('#streak-row');
  if (streak < 1) {
    el.innerHTML = '';
    return;
  }
  const label = streak === 1 ? '1 day streak' : streak + ' day streak';
  el.innerHTML = '<span class="streak-icon">' + ICON_FLAME + '</span>' + label;
}

export function renderCategoryPills(selectedCategory, onCategoryChange) {
  const categories = ['All', ...new Set(POSES.map(p => p.category))];
  const container  = qs('#category-pills');
  container.innerHTML = '';

  categories.forEach(cat => {
    const isAll    = cat === 'All';
    const isActive = isAll ? selectedCategory === null : selectedCategory === cat;
    const btn      = document.createElement('button');
    btn.className  = 'category-pill' + (isActive ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      onCategoryChange(isAll ? null : cat);
    });
    container.appendChild(btn);
  });
}

export function renderLengthPicker(selectedLength, onLengthChange) {
  qsa('.length-option').forEach(btn => {
    const len = parseInt(btn.dataset.length);
    btn.classList.toggle('active', len === selectedLength);
    btn.onclick = () => {
      onLengthChange(len);
    };
  });
}
