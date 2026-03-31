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

const ICON_CARET_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
</svg>`;

const ICON_CARET_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
</svg>`;

const ICON_ARROWS_LR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M246.63,128a8,8,0,0,1-2.35,5.65l-32,32a8,8,0,0,1-11.32-11.32L218.75,136H37.25l17.79,17.79A8,8,0,0,1,43.72,165.45l-32-32a8,8,0,0,1,0-11.32l32-32A8,8,0,0,1,55.04,101.66L37.25,120H218.75L200.96,102.21a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,246.63,128Z"/>
</svg>`;

const ICON_CLOCK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>
</svg>`;

const ICON_LIGHTBULB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"/>
</svg>`;

const ICON_FLAME = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"/>
</svg>`;

const ICON_SLIDERS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24a16,16,0,1,1-16,16A16,16,0,0,1,104,64ZM216,168H183a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h81a32,32,0,0,0,62,0h33a8,8,0,0,0,0-16Zm-64,24a16,16,0,1,1,16-16A16,16,0,0,1,152,192Z"/>
</svg>`;

const ICON_PLANT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
  <path d="M247.63,47.89a8,8,0,0,0-7.52-7.52c-51.76-3-93.32,12.74-111.18,42.22-11.8,19.49-11.78,43.16-.16,65.74a71.34,71.34,0,0,0-14.17,27L98.33,159c7.82-16.33,7.52-33.35-1-47.49-13.2-21.79-43.67-33.47-81.5-31.25a8,8,0,0,0-7.52,7.52c-2.23,37.83,9.46,68.3,31.25,81.5A45.82,45.82,0,0,0,63.44,176,54.58,54.58,0,0,0,87,170.33l25,25V224a8,8,0,0,0,16,0V194.51a55.61,55.61,0,0,1,12.27-35,73.91,73.91,0,0,0,33.31,8.4,60.9,60.9,0,0,0,31.83-8.86C234.89,141.21,250.67,99.65,247.63,47.89ZM47.81,155.6C32.47,146.31,23.79,124.32,24,96c28.32-.24,50.31,8.47,59.6,23.81,4.85,8,5.64,17.33,2.46,26.94L61.65,122.34a8,8,0,0,0-11.31,11.31l24.41,24.41C65.14,161.24,55.82,160.45,47.81,155.6Zm149.31-10.22c-13.4,8.11-29.15,8.73-45.15,2l53.69-53.7a8,8,0,0,0-11.31-11.31L140.65,136c-6.76-16-6.15-31.76,2-45.15,13.94-23,47-35.82,89.33-34.83C232.94,98.34,220.14,131.44,197.12,145.38Z"/>
</svg>`;

const SLIDES = [
  {
    icon: ICON_PLANT,
    heading: 'Questions that grow with you',
    body: 'Start with multiple choice, then progress to flashcards, matching pairs, and building Sanskrit names as your recall improves.',
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
  renderStreak();
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

function renderStreak() {
  const streak = getStreak();
  const el = qs('#streak-row');
  if (streak < 1) {
    el.innerHTML = '';
    return;
  }
  const label = streak === 1 ? '1 day streak' : streak + ' day streak';
  el.innerHTML = '<span class="streak-icon">' + ICON_FLAME + '</span>' + label;
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
  const q = getCurrentQuestion();

  // Progress bar — denominator grows as incorrect answers accumulate, making room for retries
  const incorrectsSoFar = session.questions.filter(q => !q.isRetry && q.answered === 'incorrect' && q.pose).length;
  const estimatedTotal  = session.mainTotal + Math.min(incorrectsSoFar, 3);
  const pct = Math.min(((session.currentIndex + 1) / estimatedTotal) * 100, 100);
  qs('#progress-fill').style.width = pct + '%';

  // Reset feedback and label margin
  qs('#feedback').classList.remove('visible', 'correct', 'wrong');
  qs('#question-label').style.marginBottom = '';

  // Dispatch to type-specific setup
  if (q.type === 'multiple-choice')  setupMultipleChoice(q);
  else if (q.type === 'flashcard')   setupFlashcard(q);
  else if (q.type === 'type-english') setupTypeEnglish(q);
  else if (q.type === 'tile-build')  setupTileBuild(q);
  else if (q.type === 'matching-pairs') setupMatchingPairs(q);
}

// ── Multiple choice ───────────────────────────────────────────
function setupMultipleChoice(q) {
  const isEnToSa = q.direction === 'en-to-sa';
  qs('#question-label').textContent = isEnToSa ? 'What is the Sanskrit name?' : 'What is the English name?';
  qs('#question-text').textContent  = isEnToSa ? q.pose.english : q.pose.sanskrit;

  const grid = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid';

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
    btn.addEventListener('click', () => handleMCAnswer(optPose.id));
    grid.appendChild(btn);
  });
}

function handleMCAnswer(selectedId) {
  qsa('.option-card').forEach(btn => { btn.disabled = true; });

  const q       = getCurrentQuestion();
  const correct = selectedId === q.pose.id;
  recordAnswer(correct ? 'correct' : 'incorrect', [q.pose.id]);

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
    if (!relevantIds.has(btn.dataset.poseId)) btn.classList.add('dimmed');
  });

  showFeedback(correct ? 'correct' : 'wrong',
    correct
      ? randomFrom(CORRECT_COPY)
      : 'The answer was <em>' + (q.direction === 'en-to-sa' ? q.pose.sanskrit : q.pose.english) + '</em>'
  );
}

// ── Flashcard ────────────────────────────────────────────────
function setupFlashcard(q) {
  const isEnToSa = q.direction === 'en-to-sa';
  qs('#question-label').textContent = isEnToSa ? 'What is the Sanskrit name?' : 'What is the English name?';
  qs('#question-text').textContent  = isEnToSa ? q.pose.english : q.pose.sanskrit;

  const grid = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--flashcard';

  // Flip card
  const container = document.createElement('div');
  container.className = 'flashcard-container';

  const inner = document.createElement('div');
  inner.className = 'flashcard-inner';

  const front = document.createElement('div');
  front.className = 'flashcard-face flashcard-front';
  front.innerHTML = '<span class="flashcard-hint">Think of your answer, then tap to reveal</span>';

  const back = document.createElement('div');
  back.className = 'flashcard-face flashcard-back';
  back.textContent = isEnToSa ? q.pose.sanskrit : q.pose.english;

  inner.appendChild(front);
  inner.appendChild(back);
  container.appendChild(inner);

  // Grade buttons — shown after flip completes
  const gradeRow = document.createElement('div');
  gradeRow.className = 'flashcard-grade hidden';

  const gotItBtn = document.createElement('button');
  gotItBtn.className = 'btn-grade btn-grade--good';
  gotItBtn.textContent = 'Got it';

  const stillBtn = document.createElement('button');
  stillBtn.className = 'btn-grade btn-grade--hard';
  stillBtn.textContent = 'Still learning';

  gradeRow.appendChild(gotItBtn);
  gradeRow.appendChild(stillBtn);

  container.addEventListener('click', () => {
    if (inner.classList.contains('flipped')) return;
    inner.classList.add('flipped');
    setTimeout(() => gradeRow.classList.remove('hidden'), 420);
  });

  gotItBtn.addEventListener('click', () => {
    recordAnswer('correct', [q.pose.id]);
    setTimeout(handleContinue, 200);
  });

  stillBtn.addEventListener('click', () => {
    recordAnswer('hard', [q.pose.id]);
    setTimeout(handleContinue, 200);
  });

  grid.appendChild(container);
  grid.appendChild(gradeRow);
}

// ── Type the English ──────────────────────────────────────────
function setupTypeEnglish(q) {
  qs('#question-label').textContent = 'What is the English name?';
  qs('#question-text').textContent  = q.pose.sanskrit;

  const grid = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--type';

  const input = document.createElement('input');
  input.type          = 'text';
  input.className     = 'type-input';
  input.placeholder   = 'Type the English name...';
  input.autocomplete  = 'off';
  input.autocorrect   = 'off';
  input.spellcheck    = false;

  const submitBtn = document.createElement('button');
  submitBtn.className   = 'btn-primary btn-ember';
  submitBtn.textContent = 'Check';
  submitBtn.disabled    = true;

  input.addEventListener('input', () => {
    submitBtn.disabled = input.value.trim() === '';
  });

  const check = () => {
    const val = input.value.trim();
    if (!val) return;
    input.disabled = true;
    input.blur();
    window.scrollTo({ top: 0 });
    submitBtn.remove();
    const targets = [q.pose.english, ...(q.pose.aliases || [])];
    const correct = targets.some(t => fuzzyMatch(val, t));
    recordAnswer(correct ? 'correct' : 'incorrect', [q.pose.id]);
    showFeedback(correct ? 'correct' : 'wrong',
      correct
        ? randomFrom(CORRECT_COPY)
        : 'The answer was <em>' + q.pose.english + '</em>'
    );
  };

  submitBtn.addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });

  grid.appendChild(input);
  grid.appendChild(submitBtn);

  setTimeout(() => input.focus(), 80);
}

function fuzzyMatch(input, target) {
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

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// ── Tile build ────────────────────────────────────────────────
function setupTileBuild(q) {
  qs('#question-label').textContent = 'Build the Sanskrit name';
  qs('#question-text').textContent  = q.pose.english;

  const grid = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--tilebuild';

  const instruction = document.createElement('div');
  instruction.className = 'tilebuild-instruction';
  instruction.textContent = 'Tap tiles to build the name';

  const answerZone = document.createElement('div');
  answerZone.className = 'tilebuild-answer';

  const bankZone = document.createElement('div');
  bankZone.className = 'tilebuild-bank';

  const checkBtn = document.createElement('button');
  checkBtn.className = 'btn-primary btn-ember';
  checkBtn.textContent = 'Check';
  checkBtn.disabled = true;

  let placedTiles = []; // { word, answerEl, bankGhost }
  let answered = false;

  const updateCheckBtn = () => {
    checkBtn.disabled = placedTiles.length === 0;
  };

  const moveTileToAnswer = (word, bankGhost) => {
    bankGhost.classList.add('ghost');
    bankGhost.disabled = true;

    const el = document.createElement('button');
    el.className = 'build-tile build-tile--placed popping';
    el.textContent = word;
    el.addEventListener('animationend', () => el.classList.remove('popping'), { once: true });
    el.addEventListener('click', () => {
      if (answered) return;
      moveTileToBank(el, bankGhost);
    });
    answerZone.appendChild(el);
    placedTiles.push({ word, answerEl: el, bankGhost });
    updateCheckBtn();
  };

  const moveTileToBank = (answerEl, bankGhost) => {
    answerEl.remove();
    placedTiles = placedTiles.filter(t => t.answerEl !== answerEl);
    bankGhost.classList.remove('ghost');
    bankGhost.disabled = false;
    updateCheckBtn();
  };

  q.bankTiles.forEach(word => {
    const el = document.createElement('button');
    el.className = 'build-tile';
    el.textContent = word;
    el.addEventListener('click', () => {
      if (answered || el.classList.contains('ghost')) return;
      moveTileToAnswer(word, el);
    });
    bankZone.appendChild(el);
  });

  checkBtn.addEventListener('click', () => {
    if (answered) return;
    answered = true;

    const answer  = placedTiles.map(t => t.word).join(' ');
    const correct = answer === q.correctTiles.join(' ');

    recordAnswer(correct ? 'correct' : 'incorrect', [q.pose.id]);
    placedTiles.forEach((t, i) => {
      t.answerEl.classList.add(t.word === q.correctTiles[i] ? 'correct' : 'wrong');
    });
    checkBtn.remove();

    showFeedback(correct ? 'correct' : 'wrong',
      correct
        ? randomFrom(CORRECT_COPY)
        : 'The answer was <em>' + q.correctTiles.join(' ') + '</em>'
    );
  });

  grid.appendChild(instruction);
  grid.appendChild(answerZone);
  grid.appendChild(bankZone);
  grid.appendChild(checkBtn);
}

// ── Matching pairs ────────────────────────────────────────────
function setupMatchingPairs(q) {
  qs('#question-label').textContent = 'Match each pose to its Sanskrit name';
  qs('#question-label').style.marginBottom = '0';
  qs('#question-text').textContent  = '';

  const grid = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--matching';

  const englishPoses  = shuffle([...q.poses]);
  const sanskritPoses = shuffle([...q.poses]);

  let selectedEnglishId = null;
  const matchedIds      = new Set();

  const tryMatch = (engId, sansPoseId) => {
    const correct = engId === sansPoseId;
    const engBtn  = grid.querySelector(`.matching-tile--english[data-pose-id="${engId}"]`);
    const sansBtn = grid.querySelector(`.matching-tile--sanskrit[data-pose-id="${sansPoseId}"]`);

    if (correct) {
      matchedIds.add(engId);
      engBtn.classList.remove('selected');
      engBtn.classList.add('matched');
      sansBtn.classList.add('matched');
      engBtn.disabled  = true;
      sansBtn.disabled = true;
      selectedEnglishId = null;
      if (matchedIds.size === q.poses.length) {
        recordAnswer('correct', q.poses.map(p => p.id));
        showFeedback('correct', 'All matched.');
      }
    } else {
      engBtn.classList.add('wrong-flash');
      sansBtn.classList.add('wrong-flash');
      engBtn.disabled  = true;
      sansBtn.disabled = true;
      setTimeout(() => {
        engBtn.classList.remove('wrong-flash', 'selected');
        sansBtn.classList.remove('wrong-flash');
        engBtn.disabled  = false;
        sansBtn.disabled = false;
        selectedEnglishId = null;
      }, 500);
    }
  };

  // Interleave into a single grid so each row shares height automatically
  englishPoses.forEach((pose, i) => {
    const engBtn = document.createElement('button');
    engBtn.className     = 'matching-tile matching-tile--english';
    engBtn.dataset.poseId = pose.id;
    engBtn.textContent   = pose.english;
    engBtn.addEventListener('click', () => {
      if (matchedIds.has(pose.id)) return;
      if (selectedEnglishId === pose.id) {
        selectedEnglishId = null;
        engBtn.classList.remove('selected');
        return;
      }
      grid.querySelectorAll('.matching-tile--english').forEach(t => t.classList.remove('selected'));
      selectedEnglishId = pose.id;
      engBtn.classList.add('selected');
    });

    const sansBtn = document.createElement('button');
    sansBtn.className     = 'matching-tile matching-tile--sanskrit';
    sansBtn.dataset.poseId = sanskritPoses[i].id;
    sansBtn.textContent   = sanskritPoses[i].sanskrit;
    sansBtn.addEventListener('click', () => {
      if (matchedIds.has(sanskritPoses[i].id) || !selectedEnglishId) return;
      tryMatch(selectedEnglishId, sanskritPoses[i].id);
    });

    grid.appendChild(engBtn);
    grid.appendChild(sansBtn);
  });
}

// ── Shared feedback helper ────────────────────────────────────
function showFeedback(type, message) {
  const fb     = qs('#feedback');
  const fbText = qs('#feedback-text');
  fb.classList.add(type, 'visible');
  const icon = type === 'correct' ? ICON_CHECK : ICON_X;
  fbText.innerHTML = '<span class="feedback-icon">' + icon + '</span>' + message;
}

function handleContinue() {
  document.activeElement?.blur();
  advanceSession();

  if (isSessionComplete()) {
    if (maybeAppendRetries()) {
      renderQuestion();
      return;
    }
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
  if (pct === 1)       msg = 'Perfect. A still mind recalls all.';
  else if (pct >= 0.8) msg = 'Well done. The heat is building.';
  else if (pct >= 0.6) msg = 'Good practice. Keep returning.';
  qs('#result-message').textContent = msg;

  const streak = recordPractice();
  qs('#result-streak').innerHTML =
    '<span class="streak-icon">' + ICON_FLAME + '</span>' + streak + 'd streak';

  // Answer icons
  const dots = qs('#result-dots');
  dots.innerHTML = '';
  results.questions.forEach(q => {
    const wasCorrect = q.answered === 'correct';
    const icon = document.createElement('span');
    icon.className = 'result-icon ' + (wasCorrect ? 'correct' : 'wrong');
    icon.innerHTML = wasCorrect ? ICON_CHECK : ICON_X;
    dots.appendChild(icon);
  });
}

// ── Glossary ──────────────────────────────────────────────────
function renderGlossary() {
  const body = qs('#glossary-body');
  body.innerHTML = '';

  const hint = document.createElement('p');
  hint.className = 'glossary-hint';
  hint.textContent = 'Tap any pose to explore.';
  body.appendChild(hint);

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
      const mastered = isMastered(pose.id);
      row.innerHTML = `
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

// ── Pose card ─────────────────────────────────────────────────
let _tiltHandler  = null;
let _cardList     = POSES;
let _cardIndex    = 0;
let _touchStartX  = 0;

function showPoseCard(pose) {
  _cardList  = POSES;
  _cardIndex = POSES.findIndex(p => p.id === pose.id);
  _renderPoseCard();
  qs('#pose-card-overlay').classList.add('visible');
  _enableTilt();
}

function hidePoseCard() {
  qs('#pose-card-overlay').classList.remove('visible');
  _disableTilt();
}

function _renderPoseCard() {
  const pose = _cardList[_cardIndex];
  qs('#pose-card-category').textContent      = pose.category;
  qs('#pose-card-sanskrit').textContent      = pose.sanskrit;
  qs('#pose-card-english').textContent       = pose.english;
  qs('#pose-card-pronunciation').textContent = pose.pronunciation || '';

  const masteryEl = qs('#pose-card-mastery');
  masteryEl.className = 'pose-card-mastery';
  const filled = isNew(pose.id) ? 0 : Math.min(getLevel(pose.id), 3);
  const mastered = isMastered(pose.id);
  masteryEl.innerHTML = [0, 1, 2].map(i =>
    `<span class="mastery-pip${i < filled ? ' mastery-pip--filled' : ''}"></span>`
  ).join('');
}

function _navigatePoseCard(dir) {
  const card = qs('#pose-card');
  card.style.transition = 'opacity 0.1s ease';
  card.style.opacity    = '0';
  setTimeout(() => {
    _cardIndex = (_cardIndex + dir + _cardList.length) % _cardList.length;
    _renderPoseCard();
    card.style.opacity = '1';
  }, 110);
}

function _enableTilt() {
  const card = qs('#pose-card');
  const apply = () => {
    _tiltHandler = (e) => {
      const x = Math.max(-8, Math.min(8, (e.gamma || 0) * 0.12));
      const y = Math.max(-8, Math.min(8, ((e.beta || 45) - 45) * 0.08));
      card.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    };
    window.addEventListener('deviceorientation', _tiltHandler);
  };

  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(state => { if (state === 'granted') apply(); })
      .catch(() => {});
  } else if (window.DeviceOrientationEvent) {
    apply();
  }
}

function _disableTilt() {
  if (_tiltHandler) {
    window.removeEventListener('deviceorientation', _tiltHandler);
    _tiltHandler = null;
  }
  qs('#pose-card').style.transform = '';
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
  qs('#pose-card-back').addEventListener('click', hidePoseCard);
  qs('#pose-card-prev').innerHTML = ICON_CARET_LEFT;
  qs('#pose-card-next').innerHTML = ICON_CARET_RIGHT;
  qs('#pose-card-prev').addEventListener('click', () => _navigatePoseCard(-1));
  qs('#pose-card-next').addEventListener('click', () => _navigatePoseCard(1));

  const cardScene = qs('.pose-card-scene');
  cardScene.addEventListener('touchstart', e => { _touchStartX = e.touches[0].clientX; }, { passive: true });
  cardScene.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - _touchStartX;
    if (Math.abs(delta) > 50) _navigatePoseCard(delta < 0 ? 1 : -1);
  });

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

});
