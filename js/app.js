let selectedCategory = null;
let selectedLength   = 10;

// ── Icons (Phosphor SVG paths, inline for reliability) ────────
// ── Icons (Phosphor SVG paths, inline for reliability) ────────
const ICON_ARROW_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>
</svg>`;

const ICON_CARET_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
</svg>`;

// fill-rule="evenodd" punches the inner shape (check/X) out of the filled circle
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path fill-rule="evenodd" d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Z"/>
</svg>`;

const ICON_X = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path fill-rule="evenodd" d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Z"/>
</svg>`;

// ── DOM helpers ──────────────────────────────────────────────
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

function showScreen(id) {
  qsa('.screen').forEach(s => s.classList.remove('active'));
  qs('#' + id).classList.add('active');
}

// ── Home ─────────────────────────────────────────────────────
function renderHome() {
  renderStats();
  renderLengthPicker();
  renderCategoryPills();
  showScreen('screen-home');
}

function renderLengthPicker() {
  qsa('.length-option').forEach(btn => {
    const len = parseInt(btn.dataset.length);
    btn.classList.toggle('active', len === selectedLength);
    btn.onclick = () => {
      selectedLength = len;
      renderLengthPicker();
    };
  });
}

function renderStats() {
  const stats = getStats();
  qs('#stat-new').textContent     = stats.newCount;
  qs('#stat-due').textContent     = stats.dueCount;
  qs('#stat-learned').textContent = stats.learnedCount;
}

function renderCategoryPills() {
  const categories = ['All', ...new Set(POSES.map(p => p.category))];
  const container = qs('#category-pills');
  container.innerHTML = '';

  categories.forEach(cat => {
    const isAll    = cat === 'All';
    const isActive = isAll ? selectedCategory === null : selectedCategory === cat;
    const btn = document.createElement('button');
    btn.className = 'category-pill' + (isActive ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      selectedCategory = isAll ? null : cat;
      renderCategoryPills();
    });
    container.appendChild(btn);
  });
}

// ── Quiz ─────────────────────────────────────────────────────
function startQuiz() {
  buildSession(selectedCategory, selectedLength);
  renderQuestion();
  showScreen('screen-quiz');
}

function renderQuestion() {
  const q    = getCurrentQuestion();
  const prog = getSessionProgress();

  // Progress bar
  const pct = ((prog.current - 1) / prog.total) * 100;
  qs('#progress-fill').style.width = pct + '%';
  qs('#progress-label').textContent = prog.current + ' / ' + prog.total;

  // Direction
  const isEnToSa = q.direction === 'en-to-sa';
  qs('#question-label').textContent = isEnToSa
    ? 'What is the Sanskrit name?'
    : 'What is the English name?';
  qs('#question-text').textContent = isEnToSa ? q.pose.english : q.pose.sanskrit;

  // Options
  const grid = qs('#options-grid');
  grid.innerHTML = '';
  q.options.forEach(optPose => {
    const btn = document.createElement('button');
    btn.className = 'option-card';
    btn.dataset.poseId = optPose.id;

    const label = document.createElement('span');
    label.textContent = isEnToSa ? optPose.sanskrit : optPose.english;

    const icon = document.createElement('span');
    icon.className = 'option-icon';

    btn.appendChild(label);
    btn.appendChild(icon);
    btn.addEventListener('click', () => handleAnswer(optPose.id));
    grid.appendChild(btn);
  });

  // Reset feedback
  const fb = qs('#feedback');
  fb.classList.remove('visible', 'correct', 'wrong');
}

function handleAnswer(selectedId) {
  // Lock options
  qsa('.option-card').forEach(btn => { btn.disabled = true; });

  const correct = answerQuestion(selectedId);
  const q       = getCurrentQuestion();

  // Colour the cards, set icons, dim irrelevant options
  // Relevant = always the correct card; also the wrong pick if answered incorrectly
  const relevantIds = new Set([q.pose.id]);
  if (!correct) relevantIds.add(selectedId);

  qsa('.option-card').forEach(btn => {
    const icon = btn.querySelector('.option-icon');
    if (btn.dataset.poseId === q.pose.id) {
      btn.classList.add('correct');
      icon.innerHTML = ICON_CHECK;
    } else if (btn.dataset.poseId === selectedId && !correct) {
      btn.classList.add('wrong');
      icon.innerHTML = ICON_X;
    }
    if (!relevantIds.has(btn.dataset.poseId)) {
      btn.classList.add('dimmed');
    }
  });

  // Feedback strip
  const fb     = qs('#feedback');
  const fbText = qs('#feedback-text');
  const isEnToSa = q.direction === 'en-to-sa';

  if (correct) {
    fb.classList.add('correct');
    fbText.innerHTML = '<span class="feedback-icon">' + ICON_CHECK + '</span>' + randomFrom(CORRECT_COPY);
  } else {
    fb.classList.add('wrong');
    const rightAnswer = isEnToSa ? q.pose.sanskrit : q.pose.english;
    fbText.innerHTML = '<span class="feedback-icon">' + ICON_X + '</span>The answer was <em>' + rightAnswer + '</em>';
  }

  fb.classList.add('visible');
}

function handleContinue() {
  advanceSession();

  if (isSessionComplete()) {
    renderResult();
    showScreen('screen-result');
  } else if (shouldShowInsight()) {
    markInsightShown();
    renderInsight();
  } else {
    renderQuestion();
  }
}

// ── Insight ───────────────────────────────────────────────────
function renderInsight() {
  const insight = session.insight;
  qs('#insight-root').textContent    = insight.root;
  qs('#insight-meaning').textContent = insight.meaning;
  qs('#insight-body').textContent    = insight.explanation;

  // Only chip poses that are actually in this session
  const sessionPoseIds = new Set(session.questions.map(q => q.pose.id));
  const posesEl = qs('#insight-poses');
  posesEl.innerHTML = '';
  insight.poseIds
    .filter(id => sessionPoseIds.has(id))
    .forEach(id => {
      const pose = POSES.find(p => p.id === id);
      if (!pose) return;
      const chip = document.createElement('span');
      chip.className = 'insight-pose-chip';
      chip.textContent = pose.sanskrit;
      posesEl.appendChild(chip);
    });

  showScreen('screen-insight');
}

// ── Result ────────────────────────────────────────────────────
function renderResult() {
  const results = getSessionResults();
  const pct     = results.score / results.total;

  qs('#result-score').textContent = results.score + ' / ' + results.total;

  let msg = 'Every practice is progress.';
  if (pct === 1)      msg = 'Perfect. A still mind recalls all.';
  else if (pct >= 0.8) msg = 'Well done. The heat is building.';
  else if (pct >= 0.6) msg = 'Good practice. Keep returning.';
  qs('#result-message').textContent = msg;

  // Answer icons
  const dots = qs('#result-dots');
  dots.innerHTML = '';
  results.questions.forEach(q => {
    const icon = document.createElement('span');
    icon.className = 'result-icon ' + (q.answered ? 'correct' : 'wrong');
    icon.innerHTML = q.answered ? ICON_CHECK : ICON_X;
    dots.appendChild(icon);
  });
}

// ── Glossary ──────────────────────────────────────────────────
function renderGlossary() {
  const body = qs('#glossary-body');
  body.innerHTML = '';

  const categories = [...new Set(POSES.map(p => p.category))];

  categories.forEach(cat => {
    const poses = POSES.filter(p => p.category === cat);

    const section = document.createElement('div');
    section.className = 'glossary-section';

    const label = document.createElement('div');
    label.className = 'glossary-category-label';
    label.textContent = cat;
    section.appendChild(label);

    poses.forEach(pose => {
      const row = document.createElement('div');
      row.className = 'glossary-row';
      row.innerHTML = `
        <span class="glossary-english">${pose.english}</span>
        <span class="glossary-sanskrit">${pose.sanskrit}</span>
      `;
      section.appendChild(row);
    });

    body.appendChild(section);
  });

  showScreen('screen-glossary');
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderHome();

  qs('#quit-btn').innerHTML   = ICON_ARROW_LEFT;
  qs('#settings-caret').innerHTML = ICON_CARET_DOWN;

  qs('#settings-toggle').addEventListener('click', () => {
    const panel = qs('#settings-panel');
    const isOpen = panel.classList.toggle('open');
    qs('#settings-toggle').classList.toggle('open', isOpen);
  });

  qs('#start-btn').addEventListener('click', startQuiz);
  qs('#quit-btn').addEventListener('click', renderHome);
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
  qs('#again-btn').addEventListener('click', startQuiz);
  qs('#home-btn').addEventListener('click', renderHome);
  qs('#glossary-link').addEventListener('click', renderGlossary);
  qs('#glossary-back-btn').addEventListener('click', renderHome);
  qs('#glossary-back-btn').innerHTML = ICON_ARROW_LEFT;

  qs('#reset-btn').addEventListener('click', () => {
    selectedLength   = 10;
    selectedCategory = null;
    renderLengthPicker();
    renderCategoryPills();
  });
});
