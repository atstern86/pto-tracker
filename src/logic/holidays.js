// US Federal Holidays (observed dates) 2025–2028
// When holiday falls on Saturday → observed Friday; on Sunday → observed Monday
// Source: https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/
export const FEDERAL_HOLIDAYS = [
  // 2025
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Jr. Day
  '2025-02-17', // Presidents' Day
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas
  // 2026
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Jr. Day
  '2026-02-16', // Presidents' Day
  '2026-05-25', // Memorial Day
  '2026-06-19', // Juneteenth
  '2026-07-03', // Independence Day (observed, Jul 4 is Sat)
  '2026-09-07', // Labor Day
  '2026-10-12', // Columbus Day
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving
  '2026-12-25', // Christmas
  // 2027
  '2027-01-01', // New Year's Day
  '2027-01-18', // MLK Jr. Day
  '2027-02-15', // Presidents' Day
  '2027-05-31', // Memorial Day
  '2027-06-18', // Juneteenth (observed, Jun 19 is Sat)
  '2027-07-05', // Independence Day (observed, Jul 4 is Sun)
  '2027-09-06', // Labor Day
  '2027-10-11', // Columbus Day
  '2027-11-11', // Veterans Day
  '2027-11-25', // Thanksgiving
  '2027-12-24', // Christmas (observed, Dec 25 is Sat)
  // 2028
  '2027-12-31', // New Year's Day 2028 (observed, Jan 1 2028 is Sat → Fri Dec 31 2027)
  '2028-01-17', // MLK Jr. Day
  '2028-02-21', // Presidents' Day
  '2028-05-29', // Memorial Day
  '2028-06-19', // Juneteenth
  '2028-07-04', // Independence Day (Tue)
  '2028-09-04', // Labor Day
  '2028-10-09', // Columbus Day
  '2028-11-10', // Veterans Day (observed, Nov 11 is Sat)
  '2028-11-23', // Thanksgiving
  '2028-12-25', // Christmas
]

const COVERED_YEARS = new Set(['2025', '2026', '2027', '2028'])

const holidaySet = new Set(FEDERAL_HOLIDAYS)

/**
 * Returns true if the given ISO date string (YYYY-MM-DD) is a federal holiday.
 * Logs a console warning for dates outside the 2025–2028 coverage range.
 */
export function isFederalHoliday(isoDate) {
  const year = isoDate.slice(0, 4)
  if (!COVERED_YEARS.has(year)) {
    console.warn(`isFederalHoliday: ${isoDate} is outside covered holiday range (2025–2028). Treating as regular workday.`)
    return false
  }
  return holidaySet.has(isoDate)
}
