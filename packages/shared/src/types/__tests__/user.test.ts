import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isViewOnly } from '../user'

describe('isViewOnly', () => {
  const fixedNow = new Date('2024-06-15T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for a child who is 12', () => {
    expect(isViewOnly('2011-09-01')).toBe(true)
  })

  it('returns true for a child who just turned 12 today', () => {
    expect(isViewOnly('2012-06-15')).toBe(true)
  })

  it('returns false for a student who just turned 13 today', () => {
    expect(isViewOnly('2011-06-15')).toBe(false)
  })

  it('returns false for a 15 year old', () => {
    expect(isViewOnly('2009-03-20')).toBe(false)
  })

  it('returns false for an 18 year old', () => {
    expect(isViewOnly('2006-01-01')).toBe(false)
  })

  it('returns true for a 5 year old', () => {
    expect(isViewOnly('2019-01-01')).toBe(true)
  })

  it('returns false for a student born on Jan 1 whose birthday has passed this year', () => {
    // born 2011-01-01, now 2024-06-15 → turned 13 in Jan 2024 → not view only
    expect(isViewOnly('2011-01-01')).toBe(false)
  })

  it('returns true for a student born Dec 31 whose birthday has not yet occurred this year', () => {
    // born 2011-12-31, now 2024-06-15 → turns 13 in Dec 2024 → still view only
    expect(isViewOnly('2011-12-31')).toBe(true)
  })
})
