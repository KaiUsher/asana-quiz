import { POSES }                                    from './poses.js';
import { isMastered, isNew, getCardData, getStats } from './srs.js';
import { getStreakInfo }                             from './streak.js';
import { ICON_CHECK, ICON_FLAME }                   from './icons.js';
import { qs, showScreen }                            from './utils.js';
import { showPoseCard }                              from './overlay.js';

export function renderGlossary() {
  const body = qs('#glossary-body');
  body.innerHTML = '';

  const hint = document.createElement('p');
  hint.className   = 'glossary-hint';
  hint.textContent = 'Tap a pose to explore.';
  body.appendChild(hint);

  const categories = [...new Set(POSES.map(p => p.category))];

  categories.forEach(cat => {
    const poses = POSES.filter(p => p.category === cat);

    const section     = document.createElement('div');
    section.className = 'glossary-section';

    const label       = document.createElement('div');
    label.className   = 'glossary-category-label';
    label.textContent = cat;
    section.appendChild(label);

    poses.forEach(pose => {
      const row      = document.createElement('div');
      row.className  = 'glossary-row';
      const mastered = isMastered(pose.id);
      row.innerHTML  = `
        <span class="glossary-english">${pose.english}${mastered ? '<span class="glossary-mastered-tick">' + ICON_CHECK + '</span>' : ''}</span>
        <span class="glossary-sanskrit">${pose.sanskrit}</span>
      `;
      row.addEventListener('click', () => showPoseCard(pose));
      section.appendChild(row);
    });

    body.appendChild(section);
  });

  showScreen('screen-glossary');
}

export function renderStatsScreen() {
  const body = qs('#stats-body');
  body.innerHTML = '';

  const stats = getStats();
  const { total, masteredCount, practicingCount } = stats;
  const newCount      = total - masteredCount - practicingCount;
  const masteredPct   = masteredCount / total * 100;
  const practicingPct = (masteredCount + practicingCount) / total * 100;

  const fmtDays = n => n > 0 ? n + ' day' + (n !== 1 ? 's' : '') : '—';

  // ── Overview ──
  const overviewSection       = document.createElement('div');
  overviewSection.className   = 'stats-section';
  overviewSection.innerHTML   = `
    <div class="mastery-fraction">
      <span>${masteredCount}</span><span class="mastery-total">&thinsp;/&thinsp;${total}</span>
    </div>
    <div class="mastery-label">poses mastered</div>
    <div class="mastery-bar-track">
      <div class="mastery-bar-practicing" style="width:${practicingPct}%"></div>
      <div class="mastery-bar-mastered" style="width:${masteredPct}%"></div>
    </div>
    <div class="mastery-sub">
      ${masteredCount} mastered&ensp;&middot;&ensp;${practicingCount} in progress&ensp;&middot;&ensp;${newCount} new
    </div>
  `;
  body.appendChild(overviewSection);

  // ── Weakest poses ──
  // Require at least 3 attempts to filter out noise; sort by accuracy rate ascending
  const weakPoses = POSES
    .map(p => ({ pose: p, card: getCardData(p.id) }))
    .filter(({ card }) => card.totalSeen >= 3)
    .sort((a, b) => {
      const rateA = a.card.totalCorrect / a.card.totalSeen;
      const rateB = b.card.totalCorrect / b.card.totalSeen;
      return rateA - rateB;
    })
    .slice(0, 5);

  if (weakPoses.length > 0) {
    const weakSection       = document.createElement('div');
    weakSection.className   = 'stats-section';
    weakSection.innerHTML   = '<div class="stats-section-label">Weakest poses</div>';
    weakPoses.forEach(({ pose }) => {
      const row      = document.createElement('div');
      row.className  = 'glossary-row';
      row.innerHTML  = `
        <span class="glossary-english">${pose.english}</span>
        <span class="glossary-sanskrit">${pose.sanskrit}</span>
      `;
      row.addEventListener('click', () => showPoseCard(pose));
      weakSection.appendChild(row);
    });
    body.appendChild(weakSection);
  }

  // ── Streak ──
  const streakInfo = getStreakInfo();
  let lastPracticeText = '—';
  if (streakInfo.lastPracticeDate) {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    if      (streakInfo.lastPracticeDate === today)     lastPracticeText = 'Today';
    else if (streakInfo.lastPracticeDate === yesterday) lastPracticeText = 'Yesterday';
    else {
      const [y, m, d] = streakInfo.lastPracticeDate.split('-');
      lastPracticeText = `${d}/${m}/${y}`;
    }
  }

  const streakSection       = document.createElement('div');
  streakSection.className   = 'stats-section';
  streakSection.innerHTML   = `
    <div class="stats-section-label">Streak</div>
    <div class="stats-row">
      <span class="stats-row-label">Current streak</span>
      <span class="stats-row-value stats-row-streak"><span class="streak-icon">${ICON_FLAME}</span>${fmtDays(streakInfo.currentStreak)}</span>
    </div>
    <div class="stats-row">
      <span class="stats-row-label">Longest streak</span>
      <span class="stats-row-value stats-row-streak"><span class="streak-icon">${ICON_FLAME}</span>${fmtDays(streakInfo.longestStreak)}</span>
    </div>
    <div class="stats-row">
      <span class="stats-row-label">Last practice</span>
      <span class="stats-row-value">${lastPracticeText}</span>
    </div>
  `;
  body.appendChild(streakSection);

  // ── Accuracy ──
  const seenCards = POSES.map(p => getCardData(p.id)).filter(c => c.totalSeen > 0);
  if (seenCards.length > 0) {
    const totalSeen    = seenCards.reduce((s, c) => s + c.totalSeen,    0);
    const totalCorrect = seenCards.reduce((s, c) => s + c.totalCorrect, 0);
    const pct = Math.round(totalCorrect / totalSeen * 100);

    const accSection       = document.createElement('div');
    accSection.className   = 'stats-section';
    accSection.innerHTML   = `
      <div class="stats-section-label">Accuracy</div>
      <div class="stats-row">
        <span class="stats-row-label">Total answers</span>
        <span class="stats-row-value">${totalSeen}</span>
      </div>
      <div class="stats-row">
        <span class="stats-row-label">Correct answers</span>
        <span class="stats-row-value">${pct}%</span>
      </div>
    `;
    body.appendChild(accSection);
  }

  // ── By category ──
  const categories            = [...new Set(POSES.map(p => p.category))];
  const catSection            = document.createElement('div');
  catSection.className        = 'stats-section';
  catSection.innerHTML        = '<div class="stats-section-label">Mastery by category</div>';

  categories.forEach(cat => {
    const catPoses        = POSES.filter(p => p.category === cat);
    const catMastered     = catPoses.filter(p => isMastered(p.id)).length;
    const catPracticing   = catPoses.filter(p => !isNew(p.id) && !isMastered(p.id)).length;
    const catTotal        = catPoses.length;
    const catMasteredPct  = catMastered  / catTotal * 100;
    const catPracticingPct = (catMastered + catPracticing) / catTotal * 100;

    const row           = document.createElement('div');
    row.className       = 'stats-cat-row';
    row.innerHTML       = `
      <div class="stats-cat-header">
        <span class="stats-cat-name">${cat}</span>
        <span class="stats-cat-count">${catMastered} / ${catTotal}</span>
      </div>
      <div class="mastery-bar-track">
        <div class="mastery-bar-practicing" style="width:${catPracticingPct}%"></div>
        <div class="mastery-bar-mastered" style="width:${catMasteredPct}%"></div>
      </div>
    `;
    catSection.appendChild(row);
  });
  body.appendChild(catSection);

  showScreen('screen-stats');
}
