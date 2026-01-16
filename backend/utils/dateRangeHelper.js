// ============================================================================
// Date Range Helper
// Utility functions for handling date ranges in reports
// Author: Souleymane Camara - BIT1007326
// ============================================================================

/**
 * Get date range for "today"
 */
const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start_date: today.toISOString(),
    end_date: endOfDay.toISOString()
  };
};

/**
 * Get date range for "yesterday"
 */
const getYesterdayRange = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(yesterday);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start_date: yesterday.toISOString(),
    end_date: endOfDay.toISOString()
  };
};

/**
 * Get date range for "this week" (Monday to Sunday)
 */
const getThisWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start_date: monday.toISOString(),
    end_date: sunday.toISOString()
  };
};

/**
 * Get date range for "last week"
 */
const getLastWeekRange = () => {
  const thisWeek = getThisWeekRange();
  const lastWeekStart = new Date(thisWeek.start_date);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const lastWeekEnd = new Date(thisWeek.start_date);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);
  
  return {
    start_date: lastWeekStart.toISOString(),
    end_date: lastWeekEnd.toISOString()
  };
};

/**
 * Get date range for "this month"
 */
const getThisMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return {
    start_date: firstDay.toISOString(),
    end_date: lastDay.toISOString()
  };
};

/**
 * Get date range for "last month"
 */
const getLastMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
  lastDay.setHours(23, 59, 59, 999);
  
  return {
    start_date: firstDay.toISOString(),
    end_date: lastDay.toISOString()
  };
};

/**
 * Get date range for "last 7 days"
 */
const getLast7DaysRange = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  
  return {
    start_date: sevenDaysAgo.toISOString(),
    end_date: today.toISOString()
  };
};

/**
 * Get date range for "last 30 days"
 */
const getLast30DaysRange = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  
  return {
    start_date: thirtyDaysAgo.toISOString(),
    end_date: today.toISOString()
  };
};

/**
 * Get date range for "last 90 days"
 */
const getLast90DaysRange = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 89);
  ninetyDaysAgo.setHours(0, 0, 0, 0);
  
  return {
    start_date: ninetyDaysAgo.toISOString(),
    end_date: today.toISOString()
  };
};

/**
 * Get date range for "this year"
 */
const getThisYearRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear(), 11, 31);
  lastDay.setHours(23, 59, 59, 999);
  
  return {
    start_date: firstDay.toISOString(),
    end_date: lastDay.toISOString()
  };
};

/**
 * Get date range for "last year"
 */
const getLastYearRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear() - 1, 0, 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(today.getFullYear() - 1, 11, 31);
  lastDay.setHours(23, 59, 59, 999);
  
  return {
    start_date: firstDay.toISOString(),
    end_date: lastDay.toISOString()
  };
};

/**
 * Get date range for custom period
 */
const getCustomRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  if (start > end) {
    throw new Error('Start date must be before end date');
  }
  
  return {
    start_date: start.toISOString(),
    end_date: end.toISOString()
  };
};

/**
 * Get date range based on preset or custom dates
 */
const getDateRange = (preset, customStart = null, customEnd = null) => {
  switch (preset) {
    case 'today':
      return getTodayRange();
    case 'yesterday':
      return getYesterdayRange();
    case 'this_week':
      return getThisWeekRange();
    case 'last_week':
      return getLastWeekRange();
    case 'this_month':
      return getThisMonthRange();
    case 'last_month':
      return getLastMonthRange();
    case 'last_7_days':
      return getLast7DaysRange();
    case 'last_30_days':
      return getLast30DaysRange();
    case 'last_90_days':
      return getLast90DaysRange();
    case 'this_year':
      return getThisYearRange();
    case 'last_year':
      return getLastYearRange();
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom date range requires both start and end dates');
      }
      return getCustomRange(customStart, customEnd);
    case 'all_time':
      return { start_date: null, end_date: null };
    default:
      // Default to last 30 days if no preset specified
      return getLast30DaysRange();
  }
};

/**
 * Format date range for display
 */
const formatDateRangeDisplay = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return 'All Time';
  }
  
  const formatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  
  if (!startDate) {
    const end = new Date(endDate);
    return `Up to ${end.toLocaleDateString('en-US', formatOptions)}`;
  }
  
  if (!endDate) {
    const start = new Date(startDate);
    return `From ${start.toLocaleDateString('en-US', formatOptions)}`;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
};

/**
 * Get number of days between two dates
 */
const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is within range
 */
const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && checkDate < start) return false;
  if (end && checkDate > end) return false;
  
  return true;
};

/**
 * Get quarter date range
 */
const getQuarterRange = (year, quarter) => {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(year, startMonth + 3, 0);
  end.setHours(23, 59, 59, 999);
  
  return {
    start_date: start.toISOString(),
    end_date: end.toISOString()
  };
};

/**
 * Get current quarter
 */
const getCurrentQuarter = () => {
  const today = new Date();
  const quarter = Math.floor(today.getMonth() / 3) + 1;
  return getQuarterRange(today.getFullYear(), quarter);
};

/**
 * Get ISO week number
 */
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

/**
 * Format date to SQL date string (YYYY-MM-DD)
 */
const formatToSQLDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date to SQL datetime string (YYYY-MM-DD HH:MM:SS)
 */
const formatToSQLDateTime = (date) => {
  const d = new Date(date);
  const datePart = formatToSQLDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${datePart} ${hours}:${minutes}:${seconds}`;
};

/**
 * Validate date string
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Get relative time description
 */
const getRelativeTimeDescription = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  const daysDiff = getDaysBetween(start, end);
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1 && start.toDateString() === new Date(today - 86400000).toDateString()) {
    return 'Yesterday';
  }
  if (daysDiff <= 7) return 'Last 7 days';
  if (daysDiff <= 30) return 'Last 30 days';
  if (daysDiff <= 90) return 'Last 90 days';
  
  return formatDateRangeDisplay(startDate, endDate);
};

// ==========================================================================
// EXPORTS
// ==========================================================================

module.exports = {
  // Preset ranges
  getTodayRange,
  getYesterdayRange,
  getThisWeekRange,
  getLastWeekRange,
  getThisMonthRange,
  getLastMonthRange,
  getLast7DaysRange,
  getLast30DaysRange,
  getLast90DaysRange,
  getThisYearRange,
  getLastYearRange,
  getCurrentQuarter,
  
  // Custom and dynamic ranges
  getCustomRange,
  getDateRange,
  getQuarterRange,
  
  // Formatting and utilities
  formatDateRangeDisplay,
  formatToSQLDate,
  formatToSQLDateTime,
  getDaysBetween,
  isDateInRange,
  isValidDate,
  getWeekNumber,
  getRelativeTimeDescription
};
