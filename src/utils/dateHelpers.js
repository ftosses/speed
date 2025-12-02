// Date helper functions for Speed Unlimited

export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

export const getThisWeekDates = () => {
  const dates = [];
  const today = getToday();

  // Get dates for the next 7 days (excluding today and tomorrow)
  for (let i = 2; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return dates;
};

export const isToday = (date) => {
  const today = getToday();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
};

export const isTomorrow = (date) => {
  const tomorrow = getTomorrow();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === tomorrow.getTime();
};

export const isThisWeek = (date) => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const today = getToday();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  return checkDate > today && checkDate < weekFromNow && !isTomorrow(date);
};

export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const formatTimeForInput = (date) => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
