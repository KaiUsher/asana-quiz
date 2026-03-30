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

function buildSession(categoryFilter, sessionLength) {
  sessionLength = sessionLength || 10;
  const pool = categoryFilter ? POSES.filter(p => p.category === categoryFilter) : POSES;
  const maxLen = Math.min(sessionLength, pool.length);

  // Priority: overdue → new → already learned (for extra practice)
  const due     = shuffle(pool.filter(p => isDue(p.id)));
  const fresh   = shuffle(pool.filter(p => isNew(p.id)));
  const learned = shuffle(pool.filter(p => !isNew(p.id) && !isDue(p.id)));

  let ordered = [...due, ...fresh, ...learned].slice(0, maxLen);

  // If the filtered category has fewer poses than SESSION_LENGTH, pad with shuffle
  if (ordered.length < maxLen) {
    ordered = shuffle(pool).slice(0, maxLen);
  }

  const sessionPoseIds = new Set(ordered.map(p => p.id));
  const relevantInsights = INSIGHTS.filter(ins =>
    ins.poseIds.some(id => sessionPoseIds.has(id))
  );
  const recent       = getRecentInsightIds();
  const freshInsights = relevantInsights.filter(ins => !recent.includes(ins.id));
  const insightPool  = freshInsights.length > 0 ? freshInsights : relevantInsights;
  const insight      = insightPool.length > 0 ? randomFrom(insightPool) : null;

  session = {
    questions: ordered.map(pose => _buildQuestion(pose, pool)),
    currentIndex: 0,
    score: 0,
    category: categoryFilter || null,
    insight,
    insightShown: false,
  };
}

function _buildQuestion(pose, pool) {
  const direction = Math.random() < 0.5 ? 'en-to-sa' : 'sa-to-en';
  const wrongs = shuffle(pool.filter(p => p.id !== pose.id)).slice(0, 3);
  return {
    pose,
    direction,
    options: shuffle([pose, ...wrongs]),
    answered: null, // null | true | false
  };
}

function getCurrentQuestion() {
  return session.questions[session.currentIndex];
}

function getSessionProgress() {
  return {
    current: session.currentIndex + 1,
    total: session.questions.length,
  };
}

function answerQuestion(selectedPoseId) {
  const q = getCurrentQuestion();
  const correct = selectedPoseId === q.pose.id;
  q.answered = correct;
  if (correct) session.score++;
  updateCard(q.pose.id, correct);
  return correct;
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
