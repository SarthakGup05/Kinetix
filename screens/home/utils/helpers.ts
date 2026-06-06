export const formatDuration = (totalSeconds: number): string => {
  const mins = Math.round(totalSeconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
};

export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const m = months[date.getMonth()];
    const d = date.getDate();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${m} ${d} @ ${h}:${min}`;
  } catch {
    return 'RECENT RIDE';
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 75) return '#EAB308'; // Yellow
  if (score >= 60) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

export const getScoreGrade = (score: number): string => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
};
