const moment = require("moment");

// Recurrence Options
const Recurrence = {
  EVERY_DAY: "every_day",
  WEEKLY: "weekly",
  CUSTOM_WEEKLY: "custom_weekly",
  MONTHLY: "monthly",
  BI_WEEKLY: "bi_weekly",
};

// Helper function to get next recurrence date(s)
function getNextRecurrence(startDate, recurrenceOption, details) {
  const start = moment(startDate);

  switch (recurrenceOption) {
    case Recurrence.EVERY_DAY:
      return getDailyRecurrence(start, details);

    case Recurrence.WEEKLY:
      return getWeeklyRecurrence(start, details);

    case Recurrence.CUSTOM_WEEKLY:
      return getCustomWeeklyRecurrence(start, details);

    case Recurrence.MONTHLY:
      return getMonthlyRecurrence(start, details);

    case Recurrence.BI_WEEKLY:
      return getBiWeeklyRecurrence(start, details);

    default:
      return [];
  }
}

// Daily Recurrence
function getDailyRecurrence(start, details) {
  const duration = details.duration || 30;
  const dates = [];
  for (let i = 0; i < duration; i++) {
    dates.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
  }
  return dates;
}

// Weekly Recurrence (Specific Days of the Week)
function getWeeklyRecurrence(start, details) {
  const daysOfWeek = details.daysOfWeek || [];
  const duration = details.duration || 4; // Weeks
  const dates = [];

  for (let i = 0; i < duration; i++) {
    daysOfWeek.forEach((day) => {
      const nextDate = start
        .clone()
        .add(i * 7, "days")
        .day(day);
      if (nextDate.isAfter(start)) {
        dates.push(nextDate.format("YYYY-MM-DD"));
      }
    });
  }
  return dates;
}

// Custom Weekly (Every X Days)
function getCustomWeeklyRecurrence(start, details) {
  const interval = details.interval || 2; // Every X days
  const duration = details.duration || 30; // Total days to repeat
  const dates = [];

  for (let i = 0; i < duration; i += interval) {
    dates.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
  }
  return dates;
}

// Monthly Recurrence (Specific Dates)
function getMonthlyRecurrence(start, details) {
  const specificDates = details.specificDates || [1]; // Example: 1st and 15th
  const duration = details.duration || 6; // Months
  const dates = [];

  for (let i = 0; i < duration; i++) {
    specificDates.forEach((date) => {
      const nextDate = start.clone().add(i, "months").date(date);
      dates.push(nextDate.format("YYYY-MM-DD"));
    });
  }
  return dates;
}

// Bi-Weekly Recurrence
function getBiWeeklyRecurrence(start, details) {
  const duration = details.duration || 8; // Total number of weeks
  const dayOfWeek = start.day(); // Recurs every 2 weeks on the same day of the week
  const dates = [];

  for (let i = 0; i < duration; i += 2) {
    const nextDate = start.clone().add(i, "weeks").day(dayOfWeek);
    dates.push(nextDate.format("YYYY-MM-DD"));
  }
  return dates;
}

// Sample test
const recurrenceOption = Recurrence.WEEKLY;
const recurrenceDetails = {
  daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
  duration: 4, // Repeat for 4 weeks
};

console.log(
  getNextRecurrence("2024-01-01", recurrenceOption, recurrenceDetails)
);

module.exports = { getNextRecurrence, Recurrence };
