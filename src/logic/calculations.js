import { addDays, format, parseISO, isWeekend, getDay, eachDayOfInterval, addMonths, startOfMonth, setDate } from 'date-fns'
import { isFederalHoliday } from './holidays'

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Returns lowercase day name for an ISO date string */
export function getDayKey(isoDate) {
  return DAY_KEYS[getDay(parseISO(isoDate))]
}

/** Returns the day-length denominator for converting hours to days */
export function getDaysDenominator(profile) {
  if (profile.employmentType === 'full-time') return 7.5
  const weeklyHours = Object.values(profile.schedule).reduce((sum, h) => sum + h, 0)
  return weeklyHours / 5
}

/**
 * Returns the PTO hours cost for a single date.
 * 0 for weekends, federal holidays, or non-scheduled part-time days.
 */
export function getWorkingDayHours(isoDate, profile) {
  if (isWeekend(parseISO(isoDate))) return 0
  if (isFederalHoliday(isoDate)) return 0
  if (profile.employmentType === 'full-time') return 7.5
  return profile.schedule[getDayKey(isoDate)] ?? 0
}

/**
 * Returns total PTO hours consumed by a trip (start to end, inclusive).
 * Always derived at runtime — never cached.
 */
export function calculateTripCost(startDate, endDate, profile) {
  const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) })
  return days.reduce((sum, day) => sum + getWorkingDayHours(format(day, 'yyyy-MM-dd'), profile), 0)
}

/**
 * Returns all pay period dates (ISO strings) strictly within [fromDate, toDate] inclusive.
 * For biweekly: advances anchor to first pay date >= fromDate, then steps by 14 days.
 * For semi-monthly: returns 1st and 15th of each month in range.
 */
export function getPayPeriodDates(fromDate, toDate, profile) {
  const from = parseISO(fromDate)
  const to = parseISO(toDate)
  const results = []

  if (profile.payPeriodFrequency === 'biweekly') {
    let current = parseISO(profile.payPeriodAnchorDate)
    // Advance to first pay date >= fromDate
    while (current < from) current = addDays(current, 14)
    // Collect all dates <= toDate
    while (current <= to) {
      results.push(format(current, 'yyyy-MM-dd'))
      current = addDays(current, 14)
    }
  } else {
    // Semi-monthly: 1st and 15th of each month
    let month = startOfMonth(from)
    while (month <= to) {
      for (const dayNum of [1, 15]) {
        const candidate = setDate(month, dayNum)
        if (candidate >= from && candidate <= to) {
          results.push(format(candidate, 'yyyy-MM-dd'))
        }
      }
      month = addMonths(month, 1)
    }
    results.sort()
  }

  return results
}

/**
 * Returns projected PTO balance in hours at targetDate.
 * Accruals on targetDate ARE included.
 * Trip deductions: trips with startDate strictly < targetDate are deducted.
 * (Balance shown "going into" a trip that starts on targetDate.)
 */
export function getProjectedBalance(targetDate, profile, trips) {
  const target = parseISO(targetDate)
  const balanceAsOf = parseISO(profile.balanceAsOfDate)

  // Count accrual events: pay periods strictly after balanceAsOfDate and on/before targetDate
  const accrualDates = getPayPeriodDates(
    format(addDays(balanceAsOf, 1), 'yyyy-MM-dd'),
    targetDate,
    profile
  )
  const totalAccrual = accrualDates.length * profile.accrualRateHours

  // Deduct trips that start strictly before targetDate
  const tripDeductions = trips
    .filter(t => parseISO(t.startDate) < target)
    .reduce((sum, t) => sum + calculateTripCost(t.startDate, t.endDate, profile), 0)

  return profile.currentBalanceHours + totalAccrual - tripDeductions
}

/**
 * Builds a chronological array of events (accruals + trips) for the next 18 months.
 * Each event includes a runningBalance field.
 */
export function buildTimeline(profile, trips) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const endDate = format(addMonths(new Date(), 18), 'yyyy-MM-dd')

  // Build accrual events
  const accrualDates = getPayPeriodDates(today, endDate, profile)
  const accrualEvents = accrualDates.map(date => ({
    type: 'accrual',
    date,
    hours: profile.accrualRateHours,
  }))

  // Build trip events (only future trips within window)
  const tripEvents = trips
    .filter(t => t.startDate >= today && t.startDate <= endDate)
    .map(t => ({
      type: 'trip',
      date: t.startDate,
      id: t.id,
      name: t.name || `Trip on ${t.startDate}`,
      startDate: t.startDate,
      endDate: t.endDate,
      hours: calculateTripCost(t.startDate, t.endDate, profile),
    }))

  // Sort all events by date
  const events = [...accrualEvents, ...tripEvents].sort((a, b) => a.date.localeCompare(b.date))

  // Compute running balance — seed with balance as of today
  let balance = profile.currentBalanceHours
  // Add accruals from balanceAsOfDate to today first
  const pastAccruals = getPayPeriodDates(
    format(addDays(parseISO(profile.balanceAsOfDate), 1), 'yyyy-MM-dd'),
    today,
    profile
  )
  balance += pastAccruals.length * profile.accrualRateHours
  // Deduct past trips
  trips
    .filter(t => t.startDate < today)
    .forEach(t => { balance -= calculateTripCost(t.startDate, t.endDate, profile) })

  return events.map(event => {
    if (event.type === 'accrual') {
      balance += event.hours
    } else {
      balance -= event.hours
    }
    return { ...event, runningBalance: Math.round(balance * 100) / 100 }
  })
}
