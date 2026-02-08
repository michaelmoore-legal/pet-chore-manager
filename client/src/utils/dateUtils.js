export function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

export function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toDateString(date) {
  return date.toISOString().split('T')[0];
}

// Check if a chore should appear on a given date based on recurrence
export function choreOccursOnDate(chore, date) {
  const startDate = parseDate(chore.startDate);
  const checkDate = new Date(date);

  // Reset time for comparison
  startDate.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);

  // Check if date is before start date
  if (checkDate < startDate) {
    return false;
  }

  // Check if date is after due date (if set)
  if (chore.dueDate) {
    const dueDate = parseDate(chore.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (checkDate > dueDate) {
      return false;
    }
  }

  switch (chore.recurrence) {
    case 'none':
      // One-time chore: only appears on start date
      return isSameDay(startDate, checkDate);

    case 'daily':
      // Appears every day from start date
      return true;

    case 'weekly':
      // Appears on same day of week as start date
      return startDate.getDay() === checkDate.getDay();

    case 'monthly':
      // Appears on same day of month as start date
      // Handle edge case: if start was on 31st and month has fewer days
      const startDay = startDate.getDate();
      const daysInCheckMonth = getDaysInMonth(checkDate.getFullYear(), checkDate.getMonth());

      if (startDay > daysInCheckMonth) {
        // If start was on a day that doesn't exist in this month, use last day
        return checkDate.getDate() === daysInCheckMonth;
      }
      return checkDate.getDate() === startDay;

    default:
      return false;
  }
}

// Get all chores that should appear on a given date
export function getChoresForDate(chores, date) {
  return chores.filter(chore => choreOccursOnDate(chore, date));
}
