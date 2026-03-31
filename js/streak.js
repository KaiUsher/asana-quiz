const STREAK_KEY = 'asana_streak_v1';

function _getStreakData() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || {}; }
  catch { return {}; }
}

function _today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function _yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getStreak() {
  return _getStreakData().currentStreak || 0;
}

// Call once when a session is completed.
// Safe to call multiple times in a day — won't double-count.
function recordPractice() {
  const data  = _getStreakData();
  const today = _today();

  if (data.lastPracticeDate === today) {
    return data.currentStreak || 1; // already counted today
  }

  if (data.lastPracticeDate === _yesterday()) {
    data.currentStreak = (data.currentStreak || 1) + 1;
  } else {
    data.currentStreak = 1; // gap or first session
  }

  data.lastPracticeDate = today;
  data.longestStreak    = Math.max(data.currentStreak, data.longestStreak || 0);
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data.currentStreak;
}
