/**
 * Centralized date/time utilities for the LMJ Health application.
 * Handles ISO-8601 strings from the backend and formats them for display.
 */

// Default locale for the application
const DEFAULT_LOCALE = 'ar';

// Default timezone (can be changed if needed)
const DEFAULT_TIMEZONE = 'Asia/Damascus';

/**
 * Format an ISO-8601 date string as a date only (no time)
 * @param isoString - ISO-8601 date string from the API
 * @param locale - Locale string (default: 'ar')
 * @returns Formatted date string
 */
export function formatDate(
  isoString: string,
  locale: string = DEFAULT_LOCALE,
): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString; // Return original if invalid
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: DEFAULT_TIMEZONE,
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoString;
  }
}

/**
 * Format an ISO-8601 date string as date and time
 * @param isoString - ISO-8601 date string from the API
 * @param locale - Locale string (default: 'ar')
 * @returns Formatted date-time string
 */
export function formatDateTime(
  isoString: string,
  locale: string = DEFAULT_LOCALE,
): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString; // Return original if invalid
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: DEFAULT_TIMEZONE,
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return isoString;
  }
}

/**
 * Format an ISO-8601 date string as a short date (numeric)
 * @param isoString - ISO-8601 date string from the API
 * @param locale - Locale string (default: 'ar')
 * @returns Formatted short date string
 */
export function formatShortDate(
  isoString: string,
  locale: string = DEFAULT_LOCALE,
): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString; // Return original if invalid
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: DEFAULT_TIMEZONE,
    }).format(date);
  } catch (error) {
    console.error('Error formatting short date:', error);
    return isoString;
  }
}

/**
 * Format an ISO-8601 date string as time only
 * @param isoString - ISO-8601 date string from the API
 * @param locale - Locale string (default: 'ar')
 * @returns Formatted time string
 */
export function formatTime(
  isoString: string,
  locale: string = DEFAULT_LOCALE,
): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString; // Return original if invalid
    }

    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: DEFAULT_TIMEZONE,
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return isoString;
  }
}

/**
 * Check if a date string is valid ISO-8601 format
 * @param isoString - Date string to validate
 * @returns True if valid ISO-8601 date
 */
export function isValidISODate(isoString: string): boolean {
  try {
    const date = new Date(isoString);
    return !isNaN(date.getTime()) && isoString.includes('T');
  } catch {
    return false;
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * Note: This is a basic implementation. For more advanced relative time,
 * consider using a library like dayjs or date-fns.
 * @param isoString - ISO-8601 date string from the API
 * @param locale - Locale string (default: 'ar')
 * @returns Relative time string
 */
export function formatRelative(
  isoString: string,
  locale: string = DEFAULT_LOCALE,
): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (locale === 'ar') {
      if (diffDays > 0) return `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
      if (diffHours > 0) return `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`;
      if (diffMinutes > 0) return `منذ ${diffMinutes} ${diffMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
      return 'منذ لحظات';
    } else {
      if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      return 'just now';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return isoString;
  }
}

/**
 * Format date range (e.g., "5 ديسمبر 2024 - 10 ديسمبر 2024")
 * @param startIsoString - Start date in ISO-8601 format
 * @param endIsoString - End date in ISO-8601 format
 * @param locale - Locale string (default: 'ar')
 * @returns Formatted date range string
 */
export function formatDateRange(
  startIsoString: string,
  endIsoString: string,
  locale: string = DEFAULT_LOCALE,
): string {
  try {
    const startDate = new Date(startIsoString);
    const endDate = new Date(endIsoString);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return `${startIsoString} - ${endIsoString}`;
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: DEFAULT_TIMEZONE,
    });

    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return `${startIsoString} - ${endIsoString}`;
  }
}

/**
 * Get current date in ISO-8601 format
 * @returns Current date as ISO string
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Get date from N days ago in ISO-8601 format
 * @param days - Number of days ago
 * @returns Date N days ago as ISO string
 */
export function getDaysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
