import { POSES }                                                        from './poses.js';
import { recordInsightShown }                                            from './insights.js';
import { getSessionResults, getNewlyMasteredPoses, session }             from './quiz.js';
import { recordPractice, getStreakMilestoneToShow, acknowledgeStreakMilestone } from './streak.js';
import { ICON_FLAME, ICON_CHECK, ICON_X, STREAK_MILESTONE_COPY }        from './icons.js';
import { qs, showScreen }                                                from './utils.js';

// ── End-session flow queue ────────────────────────────────────────────
let endFlow      = [];
let _renderHomeFn = null;

export function setHomeRenderer(fn) {
  _renderHomeFn = fn;
}

export function advanceEndFlow() {
  if (endFlow.length > 0) {
    endFlow.shift()();
  } else {
    _renderHomeFn?.();
  }
}

// ── Result ────────────────────────────────────────────────────────────
export function renderResult() {
  const results = getSessionResults();
  const pct     = results.score / results.total;

  qs('#result-score').textContent = results.score + ' / ' + results.total;

  let msg = 'Every practice is progress.';
  if (pct === 1)       msg = 'Perfect. A still mind recalls all.';
  else if (pct >= 0.8) msg = 'Well done. The heat is building.';
  else if (pct >= 0.6) msg = 'Good practice. Keep returning.';
  qs('#result-message').textContent = msg;

  const streak = recordPractice();
  qs('#result-streak').innerHTML =
    '<span class="streak-icon">' + ICON_FLAME + '</span>' + streak + 'd streak';

  // Build the end-session flow queue
  endFlow = [];
  const newlyMastered = getNewlyMasteredPoses();
  if (newlyMastered.length > 0) endFlow.push(() => renderMasterySummary(newlyMastered));
  const milestone = getStreakMilestoneToShow(streak);
  if (milestone) endFlow.push(() => renderStreakMilestone(milestone));

  // Answer icons
  const dots = qs('#result-dots');
  dots.innerHTML = '';
  results.questions.forEach(q => {
    const wasCorrect = q.answered === 'correct';
    const icon       = document.createElement('span');
    icon.className   = 'result-icon ' + (wasCorrect ? 'correct' : 'wrong');
    icon.innerHTML   = wasCorrect ? ICON_CHECK : ICON_X;
    dots.appendChild(icon);
  });
}

// ── Insight ────────────────────────────────────────────────────────────
export function renderInsight() {
  const insight = session.insight;
  recordInsightShown(insight.id);
  qs('#insight-root').textContent    = insight.root;
  qs('#insight-meaning').textContent = insight.meaning;
  qs('#insight-body').textContent    = insight.explanation;

  // Only chip poses that are actually in this session
  const sessionPoseIds = new Set(
    session.questions.flatMap(q =>
      q.type === 'matching-pairs' ? q.poses.map(p => p.id) : (q.pose ? [q.pose.id] : [])
    )
  );
  const posesEl = qs('#insight-poses');
  posesEl.innerHTML = '';
  insight.poseIds
    .filter(id => sessionPoseIds.has(id))
    .forEach(id => {
      const pose = POSES.find(p => p.id === id);
      if (!pose) return;
      const chip       = document.createElement('span');
      chip.className   = 'insight-pose-chip';
      chip.textContent = pose.sanskrit;
      posesEl.appendChild(chip);
    });

  showScreen('screen-insight');
}

// ── Mastery summary ────────────────────────────────────────────────────
let _msPoses  = [];
let _msIndex  = 0;
let _msViewed = new Set();
let _msTouchX = 0;

export function renderMasterySummary(poses) {
  _msPoses  = poses;
  _msIndex  = 0;
  _msViewed = new Set();

  const count = poses.length;
  qs('#mastery-summary-count').textContent  = String(count);
  qs('#mastery-summary-nav').style.display  = count > 1 ? '' : 'none';

  _renderMasterySummaryCard(true);
  showScreen('screen-mastery-summary');
}

function _renderMasterySummaryCard(animate) {
  const pose          = _msPoses[_msIndex];
  const alreadySeen   = _msViewed.has(_msIndex);
  const shouldAnimate = animate && !alreadySeen;

  qs('#msc-category').textContent      = pose.category;
  qs('#msc-sanskrit').textContent      = pose.sanskrit;
  qs('#msc-english').textContent       = pose.english;
  qs('#msc-pronunciation').textContent = pose.pronunciation || '';

  qs('#mastery-summary-counter').textContent =
    _msPoses.length > 1 ? (_msIndex + 1) + ' / ' + _msPoses.length : '';

  // Render pips: first two filled, third unfilled initially if animating
  const masteryEl = qs('#msc-mastery');
  masteryEl.innerHTML = [0, 1, 2].map(i =>
    `<span class="mastery-pip${(i < 2 || !shouldAnimate) ? ' mastery-pip--filled' : ''}"></span>`
  ).join('');

  if (shouldAnimate) {
    _msViewed.add(_msIndex);
    const capturedIndex = _msIndex;
    setTimeout(() => {
      if (_msIndex === capturedIndex) {
        const pip = qs('#msc-mastery').querySelectorAll('.mastery-pip')[2];
        if (pip) pip.classList.add('mastery-pip--filled');
      }
    }, 450);
  }
}

export function navigateMasterySummary(dir) {
  const card          = qs('#mastery-summary-card');
  card.style.transition = 'opacity 0.1s ease';
  card.style.opacity  = '0';
  setTimeout(() => {
    _msIndex = (_msIndex + dir + _msPoses.length) % _msPoses.length;
    _renderMasterySummaryCard(true);
    card.style.opacity = '1';
  }, 110);
}

export function onMasterySummaryTouchStart(x) {
  _msTouchX = x;
}

export function onMasterySummaryTouchEnd(x) {
  const delta = x - _msTouchX;
  if (Math.abs(delta) > 50) navigateMasterySummary(delta < 0 ? 1 : -1);
}

// ── Streak milestone ───────────────────────────────────────────────────
export function renderStreakMilestone(n) {
  acknowledgeStreakMilestone(n);
  qs('#milestone-icon').innerHTML     = ICON_FLAME;
  qs('#milestone-number').textContent = n;
  qs('#milestone-label').textContent  = n === 1 ? 'day in a row' : 'days in a row';
  qs('#milestone-copy').textContent   = STREAK_MILESTONE_COPY[n] || '';
  showScreen('screen-streak-milestone');
}
