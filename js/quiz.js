const CORRECT_COPY = [
  'Well recalled.',
  'Exactly right.',
  'You know this one.',
  'Beautifully remembered.',
  'Precise.',
];

const WRONG_COPY = [
  'Not quite.',
  'Almost.',
  'Keep going.',
  'This one will come.',
];

let session = {
  questions: [],
  currentIndex: 0,
  score: 0,
  category: null,
};

function _questionTypeForLevel(level) {
  const r = Math.random();
  if (level <= 1) {
    return r < 0.80 ? 'multiple-choice' : 'flashcard';
  }
  if (level === 2) {
    return r < 0.25 ? 'multiple-choice' : 'flashcard';
  }
  // Level 3: all types, weighted toward the harder ones
  if (r < 0.12) return 'multiple-choice';
  if (r < 0.35) return 'flashcard';
  return r < 0.675 ? 'tile-build' : 'type-english';
}

function _buildQuestion(pose, pool) {
  const type = _questionTypeForLevel(getLevel(pose.id));

  if (type === 'multiple-choice') {
    const direction = Math.random() < 0.5 ? 'en-to-sa' : 'sa-to-en';
    const wrongs = shuffle(pool.filter(p => p.id !== pose.id)).slice(0, 3);
    return { type, pose, direction, options: shuffle([pose, ...wrongs]), answered: null };
  }

  if (type === 'flashcard') {
    const direction = Math.random() < 0.5 ? 'en-to-sa' : 'sa-to-en';
    return { type, pose, direction, answered: null };
  }

  if (type === 'tile-build') {
    const correctTiles = pose.sanskrit.split(' ');
    // Distractor words drawn from other poses — keeps them educational
    const allWords = [...new Set(
      pool.filter(p => p.id !== pose.id).flatMap(p => p.sanskrit.split(' '))
    )].filter(w => !correctTiles.includes(w));
    const distractors = shuffle(allWords).slice(0, 3);
    return {
      type,
      pose,
      correctTiles,
      bankTiles: shuffle([...correctTiles, ...distractors]),
      answered: null,
    };
  }

  // type-english: show Sanskrit, type the English
  return { type, pose, answered: null };
}

function buildSession(categoryFilter, sessionLength) {
  sessionLength = sessionLength || 10;
  const pool = categoryFilter ? POSES.filter(p => p.category === categoryFilter) : POSES;
  const maxLen = Math.min(sessionLength, pool.length);

  const due     = shuffle(pool.filter(p => isDue(p.id)));
  const fresh   = shuffle(pool.filter(p => isNew(p.id)));
  const learned = shuffle(pool.filter(p => !isNew(p.id) && !isDue(p.id)));

  let ordered = [...due, ...fresh, ...learned].slice(0, maxLen);
  if (ordered.length < maxLen) ordered = shuffle(pool).slice(0, maxLen);

  let questions = ordered.map(pose => _buildQuestion(pose, pool));

  // Inject a matching-pairs question in the latter half if 4+ level-2 poses available
  const matchCandidates = ordered.filter(p => getLevel(p.id) >= 2);
  if (matchCandidates.length >= 4) {
    const matchPoses = shuffle(matchCandidates).slice(0, 4);
    const matchQ = { type: 'matching-pairs', poses: matchPoses, answered: null };
    const insertAt = Math.floor(Math.random() * (questions.length + 1));
    questions.splice(insertAt, 0, matchQ);
  }

  // Insight selection
  const sessionPoseIds = new Set(ordered.map(p => p.id));
  const relevantInsights = INSIGHTS.filter(ins => ins.poseIds.some(id => sessionPoseIds.has(id)));
  const recent        = getRecentInsightIds();
  const freshInsights = relevantInsights.filter(ins => !recent.includes(ins.id));
  const insightPool   = freshInsights.length > 0 ? freshInsights : relevantInsights;
  const insight       = insightPool.length > 0 ? randomFrom(insightPool) : null;

  session = {
    questions,
    currentIndex: 0,
    score: 0,
    mainTotal: questions.length,
    category: categoryFilter || null,
    insight,
    insightShown: false,
    pool,
    retriesAppended: false,
  };
}

function getCurrentQuestion() {
  return session.questions[session.currentIndex];
}

function getSessionProgress() {
  return { current: session.currentIndex + 1, total: session.questions.length };
}

// grade: 'correct' | 'incorrect' | 'hard'
// poseIds: array — single pose for MC/flashcard/type, all 4 for matching-pairs
function recordAnswer(grade, poseIds) {
  const q = getCurrentQuestion();
  q.answered = grade;
  if (grade === 'correct') session.score++;
  if (!q.isRetry) {
    poseIds.forEach(id => updateCard(id, grade));
  }
}

function maybeAppendRetries() {
  if (session.retriesAppended) return false;
  session.retriesAppended = true;

  const incorrects = session.questions
    .filter(q => !q.isRetry && q.answered === 'incorrect' && q.pose)
    .slice(-3);

  if (incorrects.length === 0) return false;

  incorrects.forEach(orig => {
    const pose = orig.pose;
    // Always use full POSES for distractors to guarantee 3 options
    const wrongs = shuffle(POSES.filter(p => p.id !== pose.id)).slice(0, 3);
    session.questions.push({
      type: 'multiple-choice',
      pose,
      direction: Math.random() < 0.5 ? 'en-to-sa' : 'sa-to-en',
      options: shuffle([pose, ...wrongs]),
      answered: null,
      isRetry: true,
    });
  });

  return true;
}

function advanceSession() {
  session.currentIndex++;
}

function isSessionComplete() {
  return session.currentIndex >= session.questions.length;
}

function getSessionResults() {
  return {
    score: session.score,
    total: session.questions.length,
    questions: session.questions,
  };
}

function shouldShowInsight() {
  return session.insight &&
    !session.insightShown &&
    session.currentIndex === Math.floor(session.questions.length / 2);
}

function markInsightShown() {
  session.insightShown = true;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
