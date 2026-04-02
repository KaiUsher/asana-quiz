import { isSessionActive }                             from './quiz.js';
import {
  ICON_ARROW_LEFT, ICON_CARET_DOWN,
  ICON_CARET_LEFT, ICON_CARET_RIGHT,
}                                                      from './icons.js';
import { qs, showScreen }                              from './utils.js';
import {
  renderHome,
  renderCategoryPills,
  renderLengthPicker,
}                                                      from './render-home.js';
import { renderGlossary, renderStatsScreen }           from './render-glossary-stats.js';
import { startQuiz, renderQuestion, handleContinue }   from './render-quiz.js';
import {
  advanceEndFlow,
  setHomeRenderer,
  navigateMasterySummary,
  onMasterySummaryTouchStart,
  onMasterySummaryTouchEnd,
}                                                      from './render-results.js';
import {
  showPoseCard,
  hidePoseCard,
  navigatePoseCard,
  onPoseCardTouchStart,
  onPoseCardTouchEnd,
}                                                      from './overlay.js';
import {
  showOnboarding,
  hideOnboarding,
  advanceOnboarding,
  shouldShowOnboarding,
}                                                      from './onboarding.js';

// ── App-level state ───────────────────────────────────────────────────
let selectedCategory = null;
let selectedLength   = 10;

// ── PWA update flow ───────────────────────────────────────────────────
let _pendingWorker = null;
let _swReloadReady = false;

function _applyUpdate() {
  document.getElementById('update-overlay').style.opacity = '1';
  setTimeout(() => {
    _swReloadReady = true;
    _pendingWorker.postMessage('SKIP_WAITING');
  }, 300);
}

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Callbacks for home screen state changes
  const onCategoryChange = cat => {
    selectedCategory = cat;
    renderCategoryPills(selectedCategory, onCategoryChange);
  };
  const onLengthChange = len => {
    selectedLength = len;
    renderLengthPicker(selectedLength, onLengthChange);
  };

  const checkUpdate  = () => { if (_pendingWorker) { _applyUpdate(); return true; } return false; };
  const doRenderHome = () => renderHome(selectedCategory, selectedLength, checkUpdate, onCategoryChange, onLengthChange);

  // Register home renderer with end-flow so advanceEndFlow can return home
  setHomeRenderer(doRenderHome);

  // Initial render
  doRenderHome();

  // ── Nav button icons ──────────────────────────────────────────────
  qs('#quit-btn').innerHTML            = ICON_ARROW_LEFT;
  qs('#settings-caret').innerHTML      = ICON_CARET_DOWN;
  qs('#glossary-back-btn').innerHTML   = ICON_ARROW_LEFT;
  qs('#stats-back-btn').innerHTML      = ICON_ARROW_LEFT;
  qs('#mastery-caret').innerHTML       = ICON_CARET_RIGHT;
  qs('#mastery-summary-prev').innerHTML = ICON_CARET_LEFT;
  qs('#mastery-summary-next').innerHTML = ICON_CARET_RIGHT;
  qs('#pose-card-prev').innerHTML      = ICON_CARET_LEFT;
  qs('#pose-card-next').innerHTML      = ICON_CARET_RIGHT;

  // ── Settings panel ────────────────────────────────────────────────
  qs('#settings-toggle').addEventListener('click', () => {
    const panel  = qs('#settings-panel');
    const isOpen = panel.classList.toggle('open');
    qs('#settings-toggle').classList.toggle('open', isOpen);
  });

  // ── Quiz ──────────────────────────────────────────────────────────
  qs('#start-btn').addEventListener('click',    () => startQuiz(selectedCategory, selectedLength));
  qs('#quit-btn').addEventListener('click',     doRenderHome);
  qs('#continue-btn').addEventListener('click', handleContinue);

  qs('#insight-continue-btn').addEventListener('click', () => {
    const screen = qs('#screen-insight');
    screen.classList.add('exiting');
    setTimeout(() => {
      screen.classList.remove('exiting');
      renderQuestion();
      showScreen('screen-quiz');
    }, 320);
  });

  // ── End-session flow ──────────────────────────────────────────────
  qs('#end-continue-btn').addEventListener('click',        advanceEndFlow);
  qs('#mastery-summary-continue').addEventListener('click', advanceEndFlow);
  qs('#milestone-continue-btn').addEventListener('click',   advanceEndFlow);

  // ── Mastery summary carousel ──────────────────────────────────────
  qs('#mastery-summary-prev').addEventListener('click', () => navigateMasterySummary(-1));
  qs('#mastery-summary-next').addEventListener('click', () => navigateMasterySummary(1));
  const msScene = qs('#mastery-summary-scene');
  msScene.addEventListener('touchstart', e => onMasterySummaryTouchStart(e.touches[0].clientX),        { passive: true });
  msScene.addEventListener('touchend',   e => onMasterySummaryTouchEnd(e.changedTouches[0].clientX));

  // ── Glossary / Stats ──────────────────────────────────────────────
  qs('#glossary-link').addEventListener('click',        renderGlossary);
  qs('#glossary-back-btn').addEventListener('click',    doRenderHome);
  qs('#stats-back-btn').addEventListener('click',       doRenderHome);
  qs('.mastery-block').addEventListener('click',        renderStatsScreen);

  // ── Pose card overlay ─────────────────────────────────────────────
  qs('#pose-card-back').addEventListener('click', hidePoseCard);
  qs('#pose-card-prev').addEventListener('click', () => navigatePoseCard(-1));
  qs('#pose-card-next').addEventListener('click', () => navigatePoseCard(1));

  let _touchDidFlip = false;
  const cardScene   = qs('.pose-card-scene');
  cardScene.addEventListener('touchstart', e => onPoseCardTouchStart(e.touches[0].clientX), { passive: true });
  cardScene.addEventListener('touchend',   e => {
    const action = onPoseCardTouchEnd(e.changedTouches[0].clientX);
    if (action === 'tapped') {
      const card = qs('#pose-card');
      if (card.classList.contains('has-description')) {
        card.classList.toggle('flipped');
        _touchDidFlip = true;
        setTimeout(() => { _touchDidFlip = false; }, 400);
      }
    }
  });
  qs('#pose-card').addEventListener('click', () => {
    if (_touchDidFlip) return;
    const card = qs('#pose-card');
    if (card.classList.contains('has-description')) card.classList.toggle('flipped');
  });

  // ── Onboarding ────────────────────────────────────────────────────
  qs('#how-it-works-link').addEventListener('click', showOnboarding);
  qs('#onboarding-skip').addEventListener('click',   hideOnboarding);
  qs('#onboarding-next').addEventListener('click',   advanceOnboarding);

  if (shouldShowOnboarding()) showOnboarding();
});

// ── Service worker registration ───────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw.addEventListener('statechange', () => {
        // 'installed' + an existing controller = a genuine update
        // (first install has no controller yet, so we skip it)
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          _pendingWorker = nw;
          if (!isSessionActive()) _applyUpdate();
          // If a session is active, _pendingWorker is consumed the
          // next time renderHome() is called (end of session flow).
        }
      });
    });
  }).catch(() => {}); // SW unavailable — app still works normally

  // Only reload when we deliberately triggered SKIP_WAITING.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_swReloadReady) window.location.reload();
  });
}
