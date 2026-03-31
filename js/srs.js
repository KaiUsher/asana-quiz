// SM-2 spaced repetition + question-level progression
// Stored in localStorage under SRS_KEY

const SRS_KEY = 'asana_srs_v2';

function _getSRSData() {
  try { return JSON.parse(localStorage.getItem(SRS_KEY)) || {}; }
  catch { return {}; }
}

function _saveSRSData(data) {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
}

function getCardData(poseId) {
  const defaults = {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: 0,
    totalCorrect: 0,
    totalSeen: 0,
    level: 1,       // 1 = multiple-choice, 2 = flashcard, 3 = type-english
    mastered: false,
  };
  const stored = _getSRSData()[poseId];
  return stored ? Object.assign({}, defaults, stored) : { ...defaults };
}

// grade: 'correct' | 'incorrect' | 'hard'
// correct  → advance level, SM-2 correct interval
// incorrect → stay at level, SM-2 reset interval
// hard (flashcard "Still learning") → stay at level, SM-2 reset interval
function updateCard(poseId, grade) {
  const data = _getSRSData();
  const card = getCardData(poseId);

  card.totalSeen++;
  const smCorrect = grade === 'correct';
  if (smCorrect) card.totalCorrect++;

  // Level progression — no regression, wrong answers just reschedule sooner
  if (grade === 'correct') {
    if (card.level < 3) {
      card.level++;
    } else if (!card.mastered) {
      card.mastered = true;
    }
  }

  // SM-2 interval
  if (smCorrect) {
    if (card.repetitions === 0)      card.interval = 1;
    else if (card.repetitions === 1) card.interval = 6;
    else                             card.interval = Math.round(card.interval * card.easeFactor);
    card.repetitions++;
    card.easeFactor = Math.max(1.3, card.easeFactor + 0.1);
  } else {
    card.interval = 1;
    card.repetitions = 0;
    card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
  }

  card.nextReview = Date.now() + card.interval * 864e5;
  data[poseId] = card;
  _saveSRSData(data);
}

function getLevel(poseId) {
  return getCardData(poseId).level;
}

function isNew(poseId) {
  return getCardData(poseId).totalSeen === 0;
}

function isDue(poseId) {
  const card = getCardData(poseId);
  return card.totalSeen > 0 && card.nextReview <= Date.now();
}

function isMastered(poseId) {
  return getCardData(poseId).mastered === true;
}

function getStats(poses) {
  poses = poses || POSES;
  let dueCount = 0, masteredCount = 0, practicingCount = 0;
  poses.forEach(p => {
    if (isDue(p.id))       dueCount++;
    if (isMastered(p.id))  masteredCount++;
    else if (!isNew(p.id)) practicingCount++;
  });
  return { dueCount, masteredCount, practicingCount, total: poses.length };
}
