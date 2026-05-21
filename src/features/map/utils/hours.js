export function formatHoursRange(hours) {
  if (!hours) return "08:00 - 16:00";
  return `${hours.open} - ${hours.close}`;
}

export function isOpenNow(hours, now = new Date()) {
  if (!hours?.open || !hours?.close) return true;
  const day = now.getDay();
  if (hours.days && !hours.days.includes(day)) return false;
  const [oh, om] = hours.open.split(":").map(Number);
  const [ch, cm] = hours.close.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  return mins >= openMins && mins < closeMins;
}
