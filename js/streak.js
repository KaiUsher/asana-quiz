const STREAK_KEY = 'asana_streak_v1';
const STREAK_MILESTONES = [1, 3, 7, 14, 30, 50, 100];

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

export function getStreak() {
  const data = _getStreakData();
  if (!data.lastPracticeDate) return 0;
  if (data.lastPracticeDate !== _today() && data.lastPracticeDate !== _yesterday()) return 0;
  return data.currentStreak || 0;
}

// Call once when a session is completed.
// Safe to call multiple times in a day — won't double-count.
export function recordPractice() {
  const data  = _getStreakData();
  const today = _today();

  if (data.lastPracticeDate === today) {
    return data.currentStreak || 1; // already counted today
  }

  if (data.lastPracticeDate === _yesterday()) {
    data.currentStreak = (data.currentStreak || 1) + 1;
  } else {
    data.currentStreak    = 1; // gap or first session
    data.lastMilestoneShown = 0; // reset so milestones fire again on the new run
  }

  data.lastPracticeDate = today;
  data.longestStreak    = Math.max(data.currentStreak, data.longestStreak || 0);
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data.currentStreak;
}

// Returns the highest unacknowledged milestone the current streak has reached,
// or null if none. Milestones reset when the streak resets.
export function getStreakMilestoneToShow(currentStreak) {
  const data = _getStreakData();
  const last = data.lastMilestoneShown || 0;
  const hit  = STREAK_MILESTONES.filter(m => m <= currentStreak && m > last);
  return hit.length > 0 ? Math.max(...hit) : null;
}

export function acknowledgeStreakMilestone(n) {
  const data = _getStreakData();
  data.lastMilestoneShown = n;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function getStreakInfo() {
  const data = _getStreakData();
  const streakAlive = data.lastPracticeDate === _today() || data.lastPracticeDate === _yesterday();
  return {
    currentStreak:    streakAlive ? (data.currentStreak || 0) : 0,
    longestStreak:    data.longestStreak    || 0,
    lastPracticeDate: data.lastPracticeDate || null,
  };
}
