import {
  getDayKey,
  getWorkingDayHours,
  calculateTripCost,
  getPayPeriodDates,
  getProjectedBalance,
  buildTimeline,
  getDaysDenominator,
} from './calculations'

// ─── Shared test profiles ───────────────────────────────────────────────────

const fullTimeProfile = {
  employmentType: 'full-time',
  schedule: {},
  currentBalanceHours: 40,
  balanceAsOfDate: '2026-01-01',
  payPeriodFrequency: 'biweekly',
  payPeriodAnchorDate: '2026-01-02', // Friday
  accrualRateHours: 3.75,
}

const partTimeProfile = {
  employmentType: 'part-time',
  schedule: { monday: 4.75, tuesday: 6, wednesday: 0, thursday: 7.5, friday: 0 },
  currentBalanceHours: 93.75,
  balanceAsOfDate: '2026-01-01',
  payPeriodFrequency: 'biweekly',
  payPeriodAnchorDate: '2026-01-02',
  accrualRateHours: 3.75,
}

// ─── getDayKey ───────────────────────────────────────────────────────────────

describe('getDayKey', () => {
  it('returns lowercase day name for a Monday', () => {
    expect(getDayKey('2026-03-16')).toBe('monday') // March 16 2026 is a Monday
  })
  it('returns "saturday" for a Saturday', () => {
    expect(getDayKey('2026-03-14')).toBe('saturday')
  })
})

// ─── getDaysDenominator ───────────────────────────────────────────────────────

describe('getDaysDenominator', () => {
  it('returns 7.5 for full-time', () => {
    expect(getDaysDenominator(fullTimeProfile)).toBe(7.5)
  })
  it('returns (18.25 / 5) = 3.65 for Gaby part-time', () => {
    expect(getDaysDenominator(partTimeProfile)).toBeCloseTo(3.65, 2)
  })
})

// ─── getWorkingDayHours ───────────────────────────────────────────────────────

describe('getWorkingDayHours', () => {
  describe('full-time', () => {
    it('returns 7.5 for a Monday', () => {
      expect(getWorkingDayHours('2026-03-16', fullTimeProfile)).toBe(7.5)
    })
    it('returns 0 for a Saturday', () => {
      expect(getWorkingDayHours('2026-03-14', fullTimeProfile)).toBe(0)
    })
    it('returns 0 for a Sunday', () => {
      expect(getWorkingDayHours('2026-03-15', fullTimeProfile)).toBe(0)
    })
    it('returns 0 for a federal holiday (observed Jul 3 2026)', () => {
      expect(getWorkingDayHours('2026-07-03', fullTimeProfile)).toBe(0)
    })
  })

  describe('part-time', () => {
    it('returns 4.75 for Monday (Gaby)', () => {
      expect(getWorkingDayHours('2026-03-16', partTimeProfile)).toBe(4.75) // Monday
    })
    it('returns 6 for Tuesday (Gaby)', () => {
      expect(getWorkingDayHours('2026-03-17', partTimeProfile)).toBe(6)   // Tuesday
    })
    it('returns 0 for Wednesday (Gaby off)', () => {
      expect(getWorkingDayHours('2026-03-18', partTimeProfile)).toBe(0)   // Wednesday
    })
    it('returns 7.5 for Thursday (Gaby)', () => {
      expect(getWorkingDayHours('2026-03-19', partTimeProfile)).toBe(7.5) // Thursday
    })
    it('returns 0 for Friday (Gaby off)', () => {
      expect(getWorkingDayHours('2026-03-20', partTimeProfile)).toBe(0)   // Friday
    })
    it('returns 0 for a federal holiday that falls on a scheduled day', () => {
      // Jan 19 2026 = Monday (MLK Day)
      expect(getWorkingDayHours('2026-01-19', partTimeProfile)).toBe(0)
    })
  })
})

// ─── calculateTripCost ────────────────────────────────────────────────────────

describe('calculateTripCost', () => {
  it('full week Mon–Fri full-time = 37.5 hrs', () => {
    // March 16–20 2026 (Mon–Fri), no holidays
    expect(calculateTripCost('2026-03-16', '2026-03-20', fullTimeProfile)).toBe(37.5)
  })

  it('full week Mon–Fri part-time = 18.25 hrs', () => {
    // 4.75 + 6 + 0 + 7.5 + 0
    expect(calculateTripCost('2026-03-16', '2026-03-20', partTimeProfile)).toBe(18.25)
  })

  it('week containing July 4 holiday (observed Jul 3 Fri 2026): full-time gets one free day', () => {
    // Jun 29 (Mon) – Jul 3 (Fri): Jul 3 is observed Independence Day
    // Mon–Thu = 4 × 7.5 = 30, Fri Jul 3 = 0 → 30
    expect(calculateTripCost('2026-06-29', '2026-07-03', fullTimeProfile)).toBe(30)
  })

  it('single day (Mon) full-time = 7.5 hrs', () => {
    expect(calculateTripCost('2026-03-16', '2026-03-16', fullTimeProfile)).toBe(7.5)
  })

  it('weekend only = 0 hrs', () => {
    expect(calculateTripCost('2026-03-14', '2026-03-15', fullTimeProfile)).toBe(0)
  })
})

// ─── getPayPeriodDates ────────────────────────────────────────────────────────

describe('getPayPeriodDates', () => {
  describe('biweekly', () => {
    it('returns pay dates within range, starting from first date on or after fromDate', () => {
      // Anchor: 2026-01-02 (Fri). Next: 2026-01-16, 2026-01-30, 2026-02-13...
      const dates = getPayPeriodDates('2026-01-10', '2026-02-20', {
        payPeriodFrequency: 'biweekly',
        payPeriodAnchorDate: '2026-01-02',
      })
      expect(dates).toEqual(['2026-01-16', '2026-01-30', '2026-02-13'])
    })

    it('includes anchor date itself if it falls within range', () => {
      const dates = getPayPeriodDates('2026-01-02', '2026-01-02', {
        payPeriodFrequency: 'biweekly',
        payPeriodAnchorDate: '2026-01-02',
      })
      expect(dates).toEqual(['2026-01-02'])
    })

    it('returns empty array when no pay dates fall in range', () => {
      const dates = getPayPeriodDates('2026-01-03', '2026-01-15', {
        payPeriodFrequency: 'biweekly',
        payPeriodAnchorDate: '2026-01-02',
      })
      expect(dates).toEqual([])
    })
  })

  describe('semi-monthly', () => {
    it('returns 1st and 15th of each month in range', () => {
      const dates = getPayPeriodDates('2026-01-10', '2026-03-05', {
        payPeriodFrequency: 'semi-monthly',
        payPeriodAnchorDate: null,
      })
      expect(dates).toEqual(['2026-01-15', '2026-02-01', '2026-02-15', '2026-03-01'])
    })
  })
})

// ─── getProjectedBalance ──────────────────────────────────────────────────────

describe('getProjectedBalance', () => {
  it('returns starting balance when no time has passed and no trips', () => {
    expect(getProjectedBalance('2026-01-01', fullTimeProfile, [])).toBe(40)
  })

  it('adds accruals for pay periods between balanceAsOfDate and targetDate', () => {
    // Anchor 2026-01-02, balance as of Jan 1. Target: Feb 1.
    // Pay dates in (Jan1, Feb1]: Jan 2, Jan 16, Jan 30 → 3 accruals × 3.75 = 11.25
    // Total: 40 + 11.25 = 51.25
    expect(getProjectedBalance('2026-02-01', fullTimeProfile, [])).toBeCloseTo(51.25, 2)
  })

  it('pay period ON targetDate is included in accrual', () => {
    // Target = Jan 2 (pay date). Should include that accrual.
    // Pay periods in (Jan1, Jan2]: Jan 2 → 1 × 3.75 = 3.75 → 40 + 3.75 = 43.75
    expect(getProjectedBalance('2026-01-02', fullTimeProfile, [])).toBe(43.75)
  })

  it('deducts trip cost for trips with startDate strictly before targetDate', () => {
    const trips = [{ startDate: '2026-01-05', endDate: '2026-01-09' }] // Mon–Fri
    // Trip cost: 5 × 7.5 = 37.5 hrs. Target = Jan 10.
    // Accruals: Jan 2 only → +3.75. Total: 40 + 3.75 - 37.5 = 6.25
    expect(getProjectedBalance('2026-01-10', fullTimeProfile, trips)).toBeCloseTo(6.25, 2)
  })

  it('trip starting ON targetDate is NOT yet deducted (balance going into the trip)', () => {
    const trips = [{ startDate: '2026-01-05', endDate: '2026-01-09' }]
    // Target = Jan 5 (trip start). Trip NOT deducted. Accruals: Jan 2 → +3.75
    expect(getProjectedBalance('2026-01-05', fullTimeProfile, trips)).toBeCloseTo(43.75, 2)
  })

  it('can return negative balance', () => {
    const trips = [{ startDate: '2026-01-05', endDate: '2026-01-30' }] // 4 weeks
    const result = getProjectedBalance('2026-02-01', fullTimeProfile, trips)
    expect(result).toBeLessThan(0)
  })
})

// ─── buildTimeline ────────────────────────────────────────────────────────────

describe('buildTimeline', () => {
  it('returns sorted events with types accrual and trip', () => {
    const trips = [{ id: '1', name: 'Beach', startDate: '2026-06-01', endDate: '2026-06-05' }]
    const events = buildTimeline(fullTimeProfile, trips)
    const types = events.map(e => e.type)
    expect(types).toContain('accrual')
    expect(types).toContain('trip')
  })

  it('events are sorted by date ascending', () => {
    const events = buildTimeline(fullTimeProfile, [])
    const dates = events.map(e => e.date)
    const sorted = [...dates].sort()
    expect(dates).toEqual(sorted)
  })

  it('each event has a runningBalance field', () => {
    const events = buildTimeline(fullTimeProfile, [])
    events.forEach(e => expect(typeof e.runningBalance).toBe('number'))
  })

  it('covers approximately 18 months from today', () => {
    const events = buildTimeline(fullTimeProfile, [])
    const lastDate = new Date(events[events.length - 1].date)
    const eighteenMonths = new Date()
    eighteenMonths.setMonth(eighteenMonths.getMonth() + 18)
    expect(lastDate.getTime()).toBeLessThanOrEqual(eighteenMonths.getTime() + 86400000)
  })
})
