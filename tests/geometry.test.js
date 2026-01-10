import { describe, it, expect } from 'vitest'
import '../you/math/geometry.js'

describe('Array.prototype.intersects', () => {
  describe('2D 영역', () => {
    it('교차하는 두 영역에 대해 true를 반환한다', () => {
      const area1 = [0, 0, 10, 10]
      const area2 = [5, 5, 10, 10]

      expect(area1.intersects(area2)).toBe(true)
    })

    it('교차하지 않는 두 영역에 대해 false를 반환한다', () => {
      const area1 = [0, 0, 10, 10]
      const area2 = [20, 20, 10, 10]

      expect(area1.intersects(area2)).toBe(false)
    })

    it('잘못된 other 길이에 대해 에러를 던진다', () => {
      const area = [0, 0, 10, 10]
      const invalid = [0, 0, 10]

      expect(() => area.intersects(invalid)).toThrow()
    })
  })

  describe('3D 큐브', () => {
    it('교차하는 두 큐브에 대해 true를 반환한다', () => {
      const cube1 = [0, 0, 0, 10, 10, 10]
      const cube2 = [5, 5, 5, 10, 10, 10]

      expect(cube1.intersects(cube2)).toBe(true)
    })

    it('교차하지 않는 두 큐브에 대해 false를 반환한다', () => {
      const cube1 = [0, 0, 0, 10, 10, 10]
      const cube2 = [20, 20, 20, 10, 10, 10]

      expect(cube1.intersects(cube2)).toBe(false)
    })

    it('잘못된 other 길이에 대해 에러를 던진다', () => {
      const cube = [0, 0, 0, 10, 10, 10]
      const invalid = [0, 0, 10, 10]

      expect(() => cube.intersects(invalid)).toThrow()
    })
  })
})

describe('Array.prototype.contains', () => {
  describe('2D', () => {
    it('점이 영역 안에 있으면 true를 반환한다', () => {
      const area = [0, 0, 10, 10]
      const point = [5, 5]

      expect(area.contains(point)).toBe(true)
    })

    it('점이 영역 밖에 있으면 false를 반환한다', () => {
      const area = [0, 0, 10, 10]
      const point = [15, 15]

      expect(area.contains(point)).toBe(false)
    })

    it('영역이 다른 영역을 포함하면 true를 반환한다', () => {
      const outer = [0, 0, 20, 20]
      const inner = [5, 5, 5, 5]

      expect(outer.contains(inner)).toBe(true)
    })
  })

  describe('3D', () => {
    it('점이 큐브 안에 있으면 true를 반환한다', () => {
      const cube = [0, 0, 0, 10, 10, 10]
      const point = [5, 5, 5]

      expect(cube.contains(point)).toBe(true)
    })

    it('큐브가 다른 큐브를 포함하면 true를 반환한다', () => {
      const outer = [0, 0, 0, 20, 20, 20]
      const inner = [5, 5, 5, 5, 5, 5]

      expect(outer.contains(inner)).toBe(true)
    })
  })
})
