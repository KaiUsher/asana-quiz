let selectedCategory = null;
let selectedLength   = 10;

const ONBOARDING_KEY = 'asana_onboarding_seen';
let currentSlide = 0;

// ── Icons (Phosphor SVG paths, inline for reliability) ────────
const ICON_ARROW_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/>
</svg>`;

const ICON_CARET_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
</svg>`;

const ICON_ARROWS_LR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M246.63,128a8,8,0,0,1-2.35,5.65l-32,32a8,8,0,0,1-11.32-11.32L218.75,136H37.25l17.79,17.79A8,8,0,0,1,43.72,165.45l-32-32a8,8,0,0,1,0-11.32l32-32A8,8,0,0,1,55.04,101.66L37.25,120H218.75L200.96,102.21a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,246.63,128Z"/>
</svg>`;

const ICON_CLOCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>
</svg>`;

const ICON_LIGHTBULB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104a88,88,0,0,1,176,0Zm-16,0a72,72,0,1,0-122.09,51.31A31.86,31.86,0,0,1,90.34,172H96v-8a8,8,0,0,1,16,0v8h32v-8a8,8,0,0,1,16,0v8h5.66a32.36,32.36,0,0,1,12.12-16.72A71.74,71.74,0,0,0,200,104Z"/>
</svg>`;

const ICON_FLAME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"/>
</svg>`;

const ICON_SLIDERS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24a16,16,0,1,1-16,16A16,16,0,0,1,104,64ZM216,168H183a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h81a32,32,0,0,0,62,0h33a8,8,0,0,0,0-16Zm-64,24a16,16,0,1,1,16-16A16,16,0,0,1,152,192Z"/>
</svg>`;

const SLIDES = [
  {
    icon: ICON_ARROWS_LR,
    heading: 'Two ways to learn',
    body: 'Each question gives you a pose name in English or Sanskrit and asks you to match the other. Four options - one correct answer.',
  },
  {
    icon: ICON_CLOCK,
    heading: 'It learns with you',
    body: 'Poses you find difficult return sooner. Ones you know well are spaced further apart as your confidence grows over time.',
  },
  {
    icon: ICON_LIGHTBULB,
    heading: 'Pause and reflect',
    body: 'Halfway through each session a Sanskrit root card appears - unpacking the building blocks that run through multiple pose names.',
  },
  {
    icon: ICON_FLAME,
    heading: 'Building mastery',
    body: 'A pose is mastered once recalled correctly across multiple sessions. Watch the progress bar on the home screen fill over time.',
  },
];

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
  const stats  = getStats();
  const total  = stats.total;
  const masteredPct  = stats.masteredCount  / total * 100;
  const practicingPct = (stats.masteredCount + stats.practicingCount) / total * 100;

  qs('#stat-mastered').textContent          = stats.masteredCount;
  qs('#stat-total').textContent             = '\u200a/\u200a' + total;
  qs('#mastery-bar-mastered').style.width   = masteredPct + '%';
  qs('#mastery-bar-practicing').style.width = practicingPct + '%';

  const sub = qs('#mastery-sub');
  if (stats.dueCount > 0) {
    sub.textContent = stats.dueCount + ' pose' + (stats.dueCount > 1 ? 's' : '') + ' due for review';
    sub.className = 'mastery-sub has-due';
  } else if (stats.practicingCount > 0) {
    sub.textContent = stats.practicingCount + ' in progress';
    sub.className = 'mastery-sub';
  } else if (stats.masteredCount === total) {
    sub.textContent = 'All poses mastered.';
    sub.className = 'mastery-sub';
  } else {
    sub.textContent = '';
    sub.className = 'mastery-sub';
  }
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
  recordInsightShown(insight.id);
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

// ── Onboarding ────────────────────────────────────────────────
function showOnboarding() {
  currentSlide = 0;
  renderOnboardingSlide(false);
  qs('#onboarding-modal').classList.add('visible');
}

function hideOnboarding() {
  qs('#onboarding-modal').classList.remove('visible');
  localStorage.setItem(ONBOARDING_KEY, '1');
}

function renderOnboardingSlide(animate) {
  const slide   = SLIDES[currentSlide];
  const content = qs('#onboarding-content');

  const update = () => {
    qs('#onboarding-icon').innerHTML    = slide.icon;
    qs('#onboarding-heading').textContent = slide.heading;
    qs('#onboarding-body').textContent    = slide.body;

    qsa('.onboarding-dot').forEach((d, i) =>
      d.classList.toggle('active', i === currentSlide)
    );

    const isLast = currentSlide === SLIDES.length - 1;
    qs('#onboarding-next').textContent          = isLast ? 'Get started' : 'Next';
    qs('#onboarding-skip').style.visibility     = isLast ? 'hidden' : 'visible';
    content.classList.remove('fading');
  };

  if (animate) {
    content.classList.add('fading');
    setTimeout(update, 180);
  } else {
    update();
  }
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

  qs('#how-it-works-link').addEventListener('click', showOnboarding);
  qs('#onboarding-skip').addEventListener('click', hideOnboarding);
  qs('#onboarding-next').addEventListener('click', () => {
    if (currentSlide < SLIDES.length - 1) {
      currentSlide++;
      renderOnboardingSlide(true);
    } else {
      hideOnboarding();
    }
  });

  // Show on first visit
  if (!localStorage.getItem(ONBOARDING_KEY)) showOnboarding();

  qs('#reset-btn').addEventListener('click', () => {
    selectedLength   = 10;
    selectedCategory = null;
    renderLengthPicker();
    renderCategoryPills();
  });
});
