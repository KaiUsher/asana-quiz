import { POSES }          from './poses.js';
import { isNew, getLevel } from './srs.js';
import { qs }              from './utils.js';

let _cardList    = POSES;
let _cardIndex   = 0;
let _touchStartX = 0;

export function showPoseCard(pose) {
  _cardList  = POSES;
  _cardIndex = POSES.findIndex(p => p.id === pose.id);
  _renderPoseCard();
  qs('#pose-card-overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

export function hidePoseCard() {
  qs('#pose-card-overlay').classList.remove('visible');
  document.body.style.overflow = '';
}

function _renderPoseCard() {
  const pose = _cardList[_cardIndex];
  const card = qs('#pose-card');

  card.classList.remove('flipped');
  card.classList.toggle('has-description', !!pose.description);

  qs('#pose-card-category').textContent      = pose.category;
  qs('#pose-card-sanskrit').textContent      = pose.sanskrit;
  qs('#pose-card-english').textContent       = pose.english;
  qs('#pose-card-pronunciation').textContent = pose.pronunciation || '';

  const masteryEl = qs('#pose-card-mastery');
  masteryEl.className = 'pose-card-mastery';
  const filled = isNew(pose.id) ? 0 : Math.min(getLevel(pose.id), 3);
  masteryEl.innerHTML = [0, 1, 2].map(i =>
    `<span class="mastery-pip${i < filled ? ' mastery-pip--filled' : ''}"></span>`
  ).join('');

  qs('#pose-card-flip-hint').textContent     = '';
  qs('#pose-card-back-category').textContent = pose.sanskrit;
  qs('#pose-card-description').textContent   = pose.description || '';
}

export function navigatePoseCard(dir) {
  const card = qs('#pose-card');
  card.style.transition = 'none';
  card.classList.remove('flipped');
  _cardIndex = (_cardIndex + dir + _cardList.length) % _cardList.length;
  _renderPoseCard();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.style.transition = '';
    });
  });
}

export function onPoseCardTouchStart(x) {
  _touchStartX = x;
}

// Returns 'navigated' | 'tapped' | null so app.js can handle flip logic
export function onPoseCardTouchEnd(x) {
  const delta = x - _touchStartX;
  if (Math.abs(delta) > 50) {
    navigatePoseCard(delta < 0 ? 1 : -1);
    return 'navigated';
  }
  if (Math.abs(delta) < 10) return 'tapped';
  return null;
}
