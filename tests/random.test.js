import { describe, it, expect } from 'vitest'
import '../you/math/vector.js'
import { Random } from '../you/math/random.js'

describe('Random', () => {
  describe('range()', () => {
    it('start와 end 사이의 값을 반환한다', () => {
      for (let i = 0; i < 100; i++) {
        const result = Random.range(10, 20)
        expect(result).toBeGreaterThanOrEqual(10)
        expect(result).toBeLessThan(20)
      }
    })
  })

  describe('repeat()', () => {
    it('지정된 개수만큼 랜덤 값 배열을 반환한다', () => {
      const result = Random.repeat(5)
      expect(result).toHaveLength(5)
      result.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      })
    })
  })

  describe('color()', () => {
    it('rgba 색상 문자열을 반환한다', () => {
      const result = Random.color()
      expect(result).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/)
    })

    it('alpha=true이면 알파값도 랜덤이다', () => {
      const result = Random.color(true)
      expect(result).toMatch(/^rgba\(\d+, \d+, \d+, [\d.]+\)$/)
    })
  })
})
