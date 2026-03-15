import { isFederalHoliday, FEDERAL_HOLIDAYS } from './holidays'

describe('isFederalHoliday', () => {
  it('returns true for July 4th 2026', () => {
    // Jul 4 2026 is Saturday — observed Jul 3 (Fri)
    expect(isFederalHoliday('2026-07-03')).toBe(true)
  })

  it('returns false for July 4th 2026 (the actual Saturday)', () => {
    expect(isFederalHoliday('2026-07-04')).toBe(false)
  })

  it('returns true for Christmas 2025', () => {
    expect(isFederalHoliday('2025-12-25')).toBe(true)
  })

  it('returns false for a regular workday', () => {
    expect(isFederalHoliday('2026-03-15')).toBe(false)
  })

  it('returns false for a date outside covered range and logs a warning', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(isFederalHoliday('2030-01-01')).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('outside covered holiday range'))
    consoleSpy.mockRestore()
  })

  it('covers all years 2025–2028 in FEDERAL_HOLIDAYS', () => {
    const years = FEDERAL_HOLIDAYS.map(d => d.slice(0, 4))
    expect(years).toContain('2025')
    expect(years).toContain('2026')
    expect(years).toContain('2027')
    expect(years).toContain('2028')
  })

  it('returns true for Friday after Thanksgiving 2026 (Nov 27)', () => {
    expect(isFederalHoliday('2026-11-27')).toBe(true)
  })

  it('returns false for Columbus Day 2026 (not observed by hospital)', () => {
    expect(isFederalHoliday('2026-10-12')).toBe(false)
  })

  it('returns false for Veterans Day 2026 (not observed by hospital)', () => {
    expect(isFederalHoliday('2026-11-11')).toBe(false)
  })

  it('has no dates that fall on a weekend (observed dates are always weekdays)', () => {
    FEDERAL_HOLIDAYS.forEach(d => {
      const day = new Date(d + 'T12:00:00Z').getUTCDay() // 0=Sun, 6=Sat
      expect(day, `${d} should not be a weekend`).not.toBe(0)
      expect(day, `${d} should not be a weekend`).not.toBe(6)
    })
  })
})
