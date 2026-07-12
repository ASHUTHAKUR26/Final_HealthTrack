/**
 * Habit Consistency Score Algorithm
 * Formula: Σ(Weight × Adherence) ÷ Σ(Weights)
 */
export function calcConsistencyScore(logs, days = 7) {
  if (!logs || logs.length === 0) return 0;
  return Math.round(Math.min(logs.length / days, 1) * 100);
}

/** Format date to short readable string e.g. "12 Jan" */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/** Format date with weekday */
export function formatDateFull(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Format time from 24h string */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = Number(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

/** Get hex color for score 0-100 */
export function scoreColor(score) {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

/** Get emoji for mood rating 1-5 */
export function moodEmoji(rating) {
  const emojis = ['', '😞', '😕', '😐', '😊', '😄'];
  return emojis[Math.round(rating)] || '😐';
}

/** Get mood label */
export function moodLabel(rating) {
  const labels = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
  return labels[Math.round(rating)] || 'Neutral';
}

/** Get mood color */
export function moodColor(rating) {
  const colors = ['', '#ef4444', '#f97316', '#6b7280', '#10b981', '#06b6d4'];
  return colors[Math.round(rating)] || '#6b7280';
}

/** Convert hours float to "Xhr Ymin" */
export function formatDuration(hours) {
  if (!hours) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Estimate calories burned */
export function estimateCalories(exerciseType, durationMins, intensity = 'moderate') {
  const MET = {
    running: { low: 6, moderate: 9, high: 13 },
    walking: { low: 2.5, moderate: 3.5, high: 5 },
    cycling: { low: 5, moderate: 7, high: 10 },
    swimming: { low: 5, moderate: 8, high: 11 },
    yoga:    { low: 2, moderate: 3, high: 4 },
    gym:     { low: 4, moderate: 6, high: 8 },
    dancing: { low: 3, moderate: 5, high: 7 },
    cricket: { low: 3, moderate: 5, high: 7 },
  };
  const key = exerciseType?.toLowerCase();
  const metMap = MET[key] || { low: 3, moderate: 5, high: 7 };
  const met = metMap[intensity] || 5;
  // Approx: MET × 3.5 × 70kg / 200 × duration
  return Math.round(met * 3.5 * 70 / 200 * durationMins);
}

/** Relative time ago */
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Get greeting based on hour */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Get today's date string for inputs */
export function todayString() {
  return new Date().toISOString().split('T')[0];
}

/** Clamp a value between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
