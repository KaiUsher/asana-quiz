// Simplified SM-2 spaced repetition
// Stored in localStorage under SRS_KEY

const SRS_KEY = 'asana_srs_v1';

function _getSRSData() {
  try { return JSON.parse(localStorage.getItem(SRS_KEY)) || {}; }
  catch { return {}; }
}

function _saveSRSData(data) {
  localStorage.setItem(SRS_KEY, JSON.stringify(data));
}

function getCardData(poseId) {
  return _getSRSData()[poseId] || {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: 0,   // epoch ms; 0 = never reviewed
    totalCorrect: 0,
    totalSeen: 0,
  };
}

function updateCard(poseId, correct) {
  const data = _getSRSData();
  const card = getCardData(poseId);

  card.totalSeen++;
  if (correct) card.totalCorrect++;

  if (correct) {
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

  card.nextReview = Date.now() + card.interval * 864e5; // 864e5 ms = 1 day
  data[poseId] = card;
  _saveSRSData(data);
}

function isNew(poseId) {
  return getCardData(poseId).totalSeen === 0;
}

function isDue(poseId) {
  const card = getCardData(poseId);
  return card.totalSeen > 0 && card.nextReview <= Date.now();
}

function getStats(poses) {
  poses = poses || POSES;
  let newCount = 0, dueCount = 0, learnedCount = 0;
  poses.forEach(p => {
    if (isNew(p.id))       newCount++;
    else if (isDue(p.id))  dueCount++;
    else                   learnedCount++;
  });
  return { newCount, dueCount, learnedCount, total: poses.length };
}
