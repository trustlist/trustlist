export function formatTime(seconds: number) {
  if (seconds < 60) {
    return '< a minute';
  }
  let timeString = '';
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  if (days > 0) {
    timeString += `${days}d `;
  }
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  if (hours > 0) {
    timeString += `${hours}h `;
  }
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  if (minutes > 0) {
    timeString += `${minutes}m `;
  }
  return timeString.trim();
}