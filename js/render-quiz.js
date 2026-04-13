import { POSES }                     from './poses.js';
import {
  session,
  getCurrentQuestion,
  recordAnswer,
  advanceSession,
  isSessionComplete,
  maybeAppendRetries,
  shouldShowInsight,
  markInsightShown,
  buildSession,
  CORRECT_COPY,
  randomFrom,
  shuffle,
}                                    from './quiz.js';
import { ICON_CHECK, ICON_X }        from './icons.js';
import { qs, qsa, showScreen, fuzzyMatch } from './utils.js';
import { renderResult, renderInsight } from './render-results.js';

export function startQuiz(selectedCategory, selectedLength) {
  buildSession(selectedCategory, selectedLength);
  renderQuestion();
  showScreen('screen-quiz');
}

export function renderQuestion() {
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
  if      (q.type === 'multiple-choice')  setupMultipleChoice(q);
  else if (q.type === 'flashcard')        setupFlashcard(q);
  else if (q.type === 'type-english')     setupTypeEnglish(q);
  else if (q.type === 'tile-build')       setupTileBuild(q);
  else if (q.type === 'matching-pairs')   setupMatchingPairs(q);
}

// ── Multiple choice ──────────────────────────────────────────────────
function setupMultipleChoice(q) {
  const isEnToSa = q.direction === 'en-to-sa';
  qs('#question-label').textContent = isEnToSa ? 'What is the Sanskrit name?' : 'What is the English name?';
  qs('#question-text').textContent  = isEnToSa ? q.pose.english : q.pose.sanskrit;

  const grid        = qs('#options-grid');
  grid.innerHTML    = '';
  grid.className    = 'options-grid';

  q.options.forEach(optPose => {
    const btn          = document.createElement('button');
    btn.className      = 'option-card';
    btn.dataset.poseId = optPose.id;

    const label        = document.createElement('span');
    label.textContent  = isEnToSa ? optPose.sanskrit : optPose.english;

    const icon         = document.createElement('span');
    icon.className     = 'option-icon';

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

// ── Flashcard ────────────────────────────────────────────────────────
function setupFlashcard(q) {
  const isEnToSa = q.direction === 'en-to-sa';
  qs('#question-label').textContent = isEnToSa ? 'What is the Sanskrit name?' : 'What is the English name?';
  qs('#question-text').textContent  = isEnToSa ? q.pose.english : q.pose.sanskrit;

  const grid     = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--flashcard';

  // Flip card
  const container     = document.createElement('div');
  container.className = 'flashcard-container';

  const inner         = document.createElement('div');
  inner.className     = 'flashcard-inner';

  const front         = document.createElement('div');
  front.className     = 'flashcard-face flashcard-front';
  front.innerHTML     = '<span class="flashcard-hint">Think of your answer, then tap to reveal</span>';

  const back          = document.createElement('div');
  back.className      = 'flashcard-face flashcard-back';
  back.textContent    = isEnToSa ? q.pose.sanskrit : q.pose.english;

  inner.appendChild(front);
  inner.appendChild(back);
  container.appendChild(inner);

  // Grade buttons — shown after flip completes
  const gradeRow      = document.createElement('div');
  gradeRow.className  = 'flashcard-grade hidden';

  const gotItBtn      = document.createElement('button');
  gotItBtn.className  = 'btn-grade btn-grade--good';
  gotItBtn.textContent = 'Got it';

  const stillBtn      = document.createElement('button');
  stillBtn.className  = 'btn-grade btn-grade--hard';
  stillBtn.textContent = 'Still learning';

  gradeRow.appendChild(gotItBtn);
  gradeRow.appendChild(stillBtn);

  container.addEventListener('click', () => {
    if (inner.classList.contains('flipped')) return;
    inner.classList.add('flipped');
    setTimeout(() => gradeRow.classList.remove('hidden'), 420);
  });

  gotItBtn.addEventListener('click', () => {
    gotItBtn.blur();
    recordAnswer('correct', [q.pose.id]);
    setTimeout(handleContinue, 200);
  });

  stillBtn.addEventListener('click', () => {
    stillBtn.blur();
    recordAnswer('hard', [q.pose.id]);
    setTimeout(handleContinue, 200);
  });

  grid.appendChild(container);
  grid.appendChild(gradeRow);
}

// ── Type the English ─────────────────────────────────────────────────
function setupTypeEnglish(q) {
  qs('#question-label').textContent = 'What is the English name?';
  qs('#question-text').textContent  = q.pose.sanskrit;

  const grid     = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--type';

  const input         = document.createElement('input');
  input.type          = 'text';
  input.className     = 'type-input';
  input.placeholder   = 'Type the English name...';
  input.autocomplete  = 'off';
  input.autocorrect   = 'off';
  input.spellcheck    = false;

  const submitBtn       = document.createElement('button');
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

// ── Tile build ───────────────────────────────────────────────────────
function setupTileBuild(q) {
  qs('#question-label').textContent = 'Build the Sanskrit name';
  qs('#question-text').textContent  = q.pose.english;

  const grid     = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--tilebuild';

  const instruction       = document.createElement('div');
  instruction.className   = 'tilebuild-instruction';
  instruction.textContent = 'Tap tiles to build the name';

  const answerZone        = document.createElement('div');
  answerZone.className    = 'tilebuild-answer';

  const bankZone          = document.createElement('div');
  bankZone.className      = 'tilebuild-bank';

  const checkBtn          = document.createElement('button');
  checkBtn.className      = 'btn-primary btn-ember';
  checkBtn.textContent    = 'Check';
  checkBtn.disabled       = true;

  let placedTiles = []; // { word, answerEl, bankGhost }
  let answered    = false;

  const updateCheckBtn = () => {
    checkBtn.disabled = placedTiles.length === 0;
  };

  const moveTileToAnswer = (word, bankGhost) => {
    bankGhost.classList.add('ghost');
    bankGhost.disabled = true;

    const el         = document.createElement('button');
    el.className     = 'build-tile build-tile--placed popping';
    el.textContent   = word;
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
    const el         = document.createElement('button');
    el.className     = 'build-tile';
    el.textContent   = word;
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

// ── Matching pairs ───────────────────────────────────────────────────
function setupMatchingPairs(q) {
  qs('#question-label').textContent             = 'Match each pose to its Sanskrit name';
  qs('#question-label').style.marginBottom      = '0';
  qs('#question-text').textContent              = '';

  const grid     = qs('#options-grid');
  grid.innerHTML = '';
  grid.className = 'options-grid options-grid--matching';

  const englishPoses  = shuffle([...q.poses]);
  const sanskritPoses = shuffle([...q.poses]);

  let selectedId   = null;
  let selectedSide = null; // 'english' | 'sanskrit'
  const matchedIds = new Set();

  const clearSelection = () => {
    grid.querySelectorAll('.matching-tile').forEach(t => t.classList.remove('selected'));
    selectedId   = null;
    selectedSide = null;
  };

  const tryMatch = (engId, sansId) => {
    const correct  = engId === sansId;
    const engBtn   = grid.querySelector(`.matching-tile--english[data-pose-id="${engId}"]`);
    const sansBtn  = grid.querySelector(`.matching-tile--sanskrit[data-pose-id="${sansId}"]`);

    clearSelection();

    if (correct) {
      matchedIds.add(engId);
      engBtn.classList.add('matched');
      sansBtn.classList.add('matched');
      engBtn.disabled  = true;
      sansBtn.disabled = true;
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
        engBtn.classList.remove('wrong-flash');
        sansBtn.classList.remove('wrong-flash');
        engBtn.disabled  = false;
        sansBtn.disabled = false;
      }, 500);
    }
  };

  // Interleave into a single grid so each row shares height automatically
  englishPoses.forEach((pose, i) => {
    const engBtn          = document.createElement('button');
    engBtn.className      = 'matching-tile matching-tile--english';
    engBtn.dataset.poseId = pose.id;
    engBtn.textContent    = pose.english;
    engBtn.addEventListener('click', () => {
      if (matchedIds.has(pose.id)) return;
      if (selectedSide === 'sanskrit') {
        tryMatch(pose.id, selectedId);
        return;
      }
      if (selectedId === pose.id) { clearSelection(); return; }
      clearSelection();
      selectedId   = pose.id;
      selectedSide = 'english';
      engBtn.classList.add('selected');
    });

    const sansBtn          = document.createElement('button');
    sansBtn.className      = 'matching-tile matching-tile--sanskrit';
    sansBtn.dataset.poseId = sanskritPoses[i].id;
    sansBtn.textContent    = sanskritPoses[i].sanskrit;
    sansBtn.addEventListener('click', () => {
      const thisPoseId = sanskritPoses[i].id;
      if (matchedIds.has(thisPoseId)) return;
      if (selectedSide === 'english') {
        tryMatch(selectedId, thisPoseId);
        return;
      }
      if (selectedId === thisPoseId) { clearSelection(); return; }
      clearSelection();
      selectedId   = thisPoseId;
      selectedSide = 'sanskrit';
      sansBtn.classList.add('selected');
    });

    grid.appendChild(engBtn);
    grid.appendChild(sansBtn);
  });
}

// ── Shared feedback helper ───────────────────────────────────────────
export function showFeedback(type, message) {
  const fb     = qs('#feedback');
  const fbText = qs('#feedback-text');
  fb.classList.add(type, 'visible');
  const icon = type === 'correct' ? ICON_CHECK : ICON_X;
  fbText.innerHTML = '<span class="feedback-icon">' + icon + '</span>' + message;
}

// ── Session continuation ─────────────────────────────────────────────
export function handleContinue() {
  document.activeElement?.blur();
  advanceSession();

  if (isSessionComplete()) {
    if (maybeAppendRetries()) {
      renderQuestion();
      setTimeout(() => { document.activeElement?.blur(); }, 0);
      return;
    }
    document.body.classList.add('dark-bg');
    const quizScreen = qs('#screen-quiz');
    quizScreen.classList.add('exiting');
    setTimeout(() => {
      quizScreen.classList.remove('exiting');
      renderResult();
      showScreen('screen-result');
    }, 250);
  } else if (shouldShowInsight()) {
    markInsightShown();
    renderInsight();
  } else {
    renderQuestion();
    setTimeout(() => { document.activeElement?.blur(); }, 0);
  }
}
