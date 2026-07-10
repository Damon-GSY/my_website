import { describe, it, expect } from 'vitest'
import { clamp, smooth, band } from './math'

describe('clamp', () => {
  it('should clamp negative values to 0', () => {
    expect(clamp(-1)).toBe(0)
    expect(clamp(-0.5)).toBe(0)
    expect(clamp(-100)).toBe(0)
  })

  it('should clamp values above 1 to 1', () => {
    expect(clamp(2)).toBe(1)
    expect(clamp(1.5)).toBe(1)
    expect(clamp(100)).toBe(1)
  })

  it('should pass through values within [0,1]', () => {
    expect(clamp(0)).toBe(0)
    expect(clamp(0.5)).toBe(0.5)
    expect(clamp(1)).toBe(1)
    expect(clamp(0.25)).toBe(0.25)
    expect(clamp(0.75)).toBe(0.75)
  })
})

describe('smooth', () => {
  describe('with from=0.1, to=0.3', () => {
    const from = 0.1
    const to = 0.3

    it('should return 0 below the ramp', () => {
      expect(smooth(from, to, 0.0)).toBe(0)
      expect(smooth(from, to, 0.05)).toBe(0)
    })

    it('should return 1 above the ramp', () => {
      expect(smooth(from, to, 0.4)).toBe(1)
      expect(smooth(from, to, 0.5)).toBe(1)
      expect(smooth(from, to, 1.0)).toBe(1)
    })

    it('should return approximately 0.5 at the midpoint', () => {
      const midpoint = (from + to) / 2 // 0.2
      expect(smooth(from, to, midpoint)).toBeCloseTo(0.5, 5)
    })

    it('should be monotonic non-decreasing across the ramp', () => {
      // Sample 9 points across [0, 0.4]
      const samples = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4]
      const values = samples.map(v => smooth(from, to, v))

      // Each value should be >= the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
      }
    })

    it('should produce smoothstep curve (3x² - 2x³)', () => {
      // At x=0.25 (normalized), smoothstep gives: 3*(0.25)² - 2*(0.25)³
      // = 3*0.0625 - 2*0.015625 = 0.1875 - 0.03125 = 0.15625
      const valueAtQuarter = from + (to - from) * 0.25 // 0.15
      const result = smooth(from, to, valueAtQuarter)
      expect(result).toBeCloseTo(0.15625, 5)

      // At x=0.75 (normalized), smoothstep gives: 3*(0.75)² - 2*(0.75)³
      // = 3*0.5625 - 2*0.421875 = 1.6875 - 0.84375 = 0.84375
      const valueAtThreeQuarter = from + (to - from) * 0.75 // 0.25
      const result2 = smooth(from, to, valueAtThreeQuarter)
      expect(result2).toBeCloseTo(0.84375, 5)
    })
  })
})

describe('band', () => {
  describe('with enter=0.12, arrive=0.18, leave=0.25, exit=0.31', () => {
    const enter = 0.12
    const arrive = 0.18
    const leave = 0.25
    const exit = 0.31

    it('should return 0 before the fade-in starts', () => {
      expect(band(enter, arrive, leave, exit, 0.0)).toBe(0)
      expect(band(enter, arrive, leave, exit, 0.05)).toBe(0)
      expect(band(enter, arrive, leave, exit, 0.1)).toBe(0)
    })

    it('should return 0 after the fade-out completes', () => {
      expect(band(enter, arrive, leave, exit, 0.31)).toBe(0)
      expect(band(enter, arrive, leave, exit, 0.4)).toBe(0)
      expect(band(enter, arrive, leave, exit, 1.0)).toBe(0)
    })

    it('should be at maximum at the midpoint of [arrive,leave]', () => {
      const midpoint = (arrive + leave) / 2 // 0.215
      const max = band(enter, arrive, leave, exit, midpoint)

      // This should be close to 1 (both fade-in complete and fade-out not started)
      expect(max).toBeGreaterThan(0.9)
    })

    it('should keep all sampled values within [0,1]', () => {
      // Sample across the entire range
      const samples = [
        0, 0.05, 0.1, 0.12, 0.15, 0.18, 0.2, 0.215, 0.23, 0.25, 0.28, 0.31,
        0.35, 0.4, 0.5, 1.0,
      ]

      for (const v of samples) {
        const result = band(enter, arrive, leave, exit, v)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(1)
      }
    })

    it('should be 0 outside [enter, exit] range', () => {
      // Before enter
      expect(band(enter, arrive, leave, exit, 0.0)).toBe(0)
      expect(band(enter, arrive, leave, exit, 0.11)).toBe(0)

      // After exit
      expect(band(enter, arrive, leave, exit, 0.31)).toBe(0)
      expect(band(enter, arrive, leave, exit, 0.5)).toBe(0)
    })

    it('should fade in during [enter, arrive]', () => {
      const atEnter = band(enter, arrive, leave, exit, enter)
      const atArrive = band(enter, arrive, leave, exit, arrive)

      expect(atEnter).toBe(0)
      expect(atArrive).toBeGreaterThan(0)

      // Monotonic during fade-in
      const midFadeIn = (enter + arrive) / 2
      const atMid = band(enter, arrive, leave, exit, midFadeIn)
      expect(atMid).toBeGreaterThan(atEnter)
      expect(atMid).toBeLessThan(atArrive)
    })

    it('should fade out during [leave, exit]', () => {
      const atLeave = band(enter, arrive, leave, exit, leave)
      const atExit = band(enter, arrive, leave, exit, exit)

      expect(atLeave).toBeGreaterThan(0)
      expect(atExit).toBe(0)

      // Monotonic during fade-out
      const midFadeOut = (leave + exit) / 2
      const atMid = band(enter, arrive, leave, exit, midFadeOut)
      expect(atMid).toBeLessThan(atLeave)
      expect(atMid).toBeGreaterThan(atExit)
    })
  })
})
