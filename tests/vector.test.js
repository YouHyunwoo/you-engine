import { describe, it, expect, beforeAll } from 'vitest'
import '../you/math/vector.js'

describe('Array Vector Operations', () => {
  describe('add()', () => {
    it('두 배열을 요소별로 더한다', () => {
      const result = [1, 2, 3].add([4, 5, 6])
      expect(result).toEqual([5, 7, 9])
    })

    it('스칼라를 모든 요소에 더한다', () => {
      const result = [1, 2, 3].add(10)
      expect(result).toEqual([11, 12, 13])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].add([1, 2, 3])).toThrow()
    })
  })

  describe('sub()', () => {
    it('두 배열을 요소별로 뺀다', () => {
      const result = [5, 7, 9].sub([1, 2, 3])
      expect(result).toEqual([4, 5, 6])
    })

    it('스칼라를 모든 요소에서 뺀다', () => {
      const result = [10, 20, 30].sub(5)
      expect(result).toEqual([5, 15, 25])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].sub([1, 2, 3])).toThrow()
    })
  })

  describe('mul()', () => {
    it('두 배열을 요소별로 곱한다', () => {
      const result = [2, 3, 4].mul([5, 6, 7])
      expect(result).toEqual([10, 18, 28])
    })

    it('스칼라를 모든 요소에 곱한다', () => {
      const result = [1, 2, 3].mul(2)
      expect(result).toEqual([2, 4, 6])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].mul([1, 2, 3])).toThrow()
    })
  })

  describe('div()', () => {
    it('두 배열을 요소별로 나눈다', () => {
      const result = [10, 20, 30].div([2, 4, 5])
      expect(result).toEqual([5, 5, 6])
    })

    it('스칼라로 모든 요소를 나눈다', () => {
      const result = [10, 20, 30].div(10)
      expect(result).toEqual([1, 2, 3])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].div([1, 2, 3])).toThrow()
    })
  })

  describe('equals()', () => {
    it('같은 배열이면 true를 반환한다', () => {
      expect([1, 2, 3].equals([1, 2, 3])).toBe(true)
    })

    it('다른 배열이면 false를 반환한다', () => {
      expect([1, 2, 3].equals([1, 2, 4])).toBe(false)
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].equals([1, 2, 3])).toThrow()
    })
  })

  describe('dot()', () => {
    it('내적을 계산한다', () => {
      const result = [1, 2, 3].dot([4, 5, 6])
      expect(result).toBe(32) // 1*4 + 2*5 + 3*6 = 32
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].dot([1, 2, 3])).toThrow()
    })
  })

  describe('negate', () => {
    it('모든 요소의 부호를 반전한다', () => {
      expect([1, -2, 3].negate).toEqual([-1, 2, -3])
    })
  })

  describe('magnitude', () => {
    it('벡터의 크기를 계산한다', () => {
      expect([3, 4].magnitude).toBe(5)
    })
  })

  describe('normalize()', () => {
    it('단위 벡터로 정규화한다', () => {
      const result = [3, 4].normalize()
      expect(result[0]).toBeCloseTo(0.6)
      expect(result[1]).toBeCloseTo(0.8)
    })
  })
})

describe('Array Static Methods', () => {
  describe('Array.zeros()', () => {
    it('1차원 0 배열을 생성한다', () => {
      expect(Array.zeros(3)).toEqual([0, 0, 0])
    })

    it('2차원 0 배열을 생성한다', () => {
      expect(Array.zeros(2, 3)).toEqual([[0, 0], [0, 0], [0, 0]])
    })

    it('인자가 없으면 에러를 던진다', () => {
      expect(() => Array.zeros()).toThrow()
    })
  })

  describe('Array.repeat()', () => {
    it('값을 반복한 배열을 생성한다', () => {
      expect(Array.repeat(3, 5)).toEqual([5, 5, 5])
    })

    it('함수를 반복 호출한 배열을 생성한다', () => {
      let counter = 0
      const result = Array.repeat(3, () => ++counter)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('Array.range()', () => {
    it('start부터 end까지 범위를 생성한다', () => {
      expect([...Array.range(0, 5)]).toEqual([0, 1, 2, 3, 4])
    })

    it('start 생략시 0부터 시작한다', () => {
      expect([...Array.range(3)]).toEqual([0, 1, 2])
    })

    it('step을 지정할 수 있다', () => {
      expect([...Array.range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8])
    })
  })

  describe('choice()', () => {
    it('랜덤하게 하나를 선택한다', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = arr.choice()
      expect(arr).toContain(result)
    })

    it('여러 개를 선택한다', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = arr.choice(3)
      expect(result).toHaveLength(3)
      result.forEach(item => expect(arr).toContain(item))
    })

    it('중복 없이 선택한다', () => {
      const arr = [1, 2, 3]
      const result = arr.choice(3)
      expect(new Set(result).size).toBe(3)
    })
  })
})
