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

    it('인접한 영역은 교차하지 않는다 (경계만 닿는 경우)', () => {
      const area1 = [0, 0, 10, 10]
      const area2 = [10, 0, 10, 10]

      expect(area1.intersects(area2)).toBe(false)
    })

    it('한 영역이 다른 영역을 완전히 포함하면 교차한다', () => {
      const outer = [0, 0, 20, 20]
      const inner = [5, 5, 5, 5]

      expect(outer.intersects(inner)).toBe(true)
      expect(inner.intersects(outer)).toBe(true)
    })

    it('부분적으로 겹치는 영역은 교차한다', () => {
      const area1 = [0, 0, 10, 10]
      const area2 = [5, 0, 10, 10]

      expect(area1.intersects(area2)).toBe(true)
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

    it('인접한 큐브는 교차하지 않는다', () => {
      const cube1 = [0, 0, 0, 10, 10, 10]
      const cube2 = [10, 0, 0, 10, 10, 10]

      expect(cube1.intersects(cube2)).toBe(false)
    })
  })

  describe('잘못된 this 길이', () => {
    it('2D도 3D도 아닌 배열에서 에러를 던진다', () => {
      const invalid = [0, 0, 0]

      expect(() => invalid.intersects([0, 0, 10, 10])).toThrow()
    })

    it('빈 배열에서 에러를 던진다', () => {
      const empty = []

      expect(() => empty.intersects([0, 0, 10, 10])).toThrow()
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

    it('점이 영역 경계에 있으면 true를 반환한다 (시작점)', () => {
      const area = [0, 0, 10, 10]
      const point = [0, 0]

      expect(area.contains(point)).toBe(true)
    })

    it('점이 영역 경계에 있으면 false를 반환한다 (끝점)', () => {
      const area = [0, 0, 10, 10]
      const point = [10, 10]

      expect(area.contains(point)).toBe(false)
    })

    it('영역이 다른 영역을 포함하지 않으면 false를 반환한다', () => {
      const area1 = [0, 0, 10, 10]
      const area2 = [5, 5, 10, 10]

      expect(area1.contains(area2)).toBe(false)
    })

    it('동일한 영역은 포함한다', () => {
      const area = [0, 0, 10, 10]

      expect(area.contains([0, 0, 10, 10])).toBe(true)
    })

    it('잘못된 other 길이에 대해 에러를 던진다', () => {
      const area = [0, 0, 10, 10]
      const invalid = [0, 0, 0]

      expect(() => area.contains(invalid)).toThrow()
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

    it('점이 큐브 밖에 있으면 false를 반환한다', () => {
      const cube = [0, 0, 0, 10, 10, 10]
      const point = [15, 15, 15]

      expect(cube.contains(point)).toBe(false)
    })

    it('큐브가 다른 큐브를 포함하지 않으면 false를 반환한다', () => {
      const cube1 = [0, 0, 0, 10, 10, 10]
      const cube2 = [5, 5, 5, 10, 10, 10]

      expect(cube1.contains(cube2)).toBe(false)
    })

    it('점이 큐브 경계에 있으면 true를 반환한다 (시작점)', () => {
      const cube = [0, 0, 0, 10, 10, 10]
      const point = [0, 0, 0]

      expect(cube.contains(point)).toBe(true)
    })

    it('잘못된 other 길이에 대해 에러를 던진다', () => {
      const cube = [0, 0, 0, 10, 10, 10]
      const invalid = [0, 0, 0, 0]

      expect(() => cube.contains(invalid)).toThrow()
    })
  })

  describe('잘못된 this 길이', () => {
    it('2D도 3D도 아닌 배열에서 에러를 던진다', () => {
      const invalid = [0, 0, 0]

      expect(() => invalid.contains([0, 0])).toThrow()
    })
  })
})

describe('Array.prototype.center', () => {
  it('2D 영역의 center를 반환한다', () => {
    const area = [0, 0, 10, 10]

    // center property returns [x + w/2, y + h/2, ...]
    // For [0, 0, 10, 10], it returns [0 + 10/2, 0 + 10/2, ...] = [5, 5, ...]
    const center = area.center
    expect(center[0]).toBe(5)
    expect(center[1]).toBe(5)
  })

  it('3D 큐브의 center를 반환한다', () => {
    const cube = [0, 0, 0, 10, 10, 10]

    // center property returns [x + dx/2, y + dy/2, z + dz/2, ...]
    const center = cube.center
    expect(center[0]).toBe(5)
    expect(center[1]).toBe(5)
    expect(center[2]).toBe(5)
  })
})

describe('Array.prototype.center2d', () => {
  it('2D 영역의 center를 반환한다', () => {
    const area = [0, 0, 10, 10]

    expect(area.center2d).toEqual([5, 5])
  })

  it('2D가 아닌 배열에서 에러를 던진다', () => {
    const invalid = [0, 0, 0, 10, 10, 10]

    expect(() => invalid.center2d).toThrow()
  })
})

describe('Array.prototype.center3d', () => {
  it('3D 큐브의 center를 반환한다', () => {
    const cube = [0, 0, 0, 10, 10, 10]

    expect(cube.center3d).toEqual([5, 5, 5])
  })

  it('3D가 아닌 배열에서 에러를 던진다', () => {
    const invalid = [0, 0, 10, 10]

    expect(() => invalid.center3d).toThrow()
  })
})

describe('Array.prototype.clip', () => {
  it('점을 영역 내로 클립한다', () => {
    const point = [15, 15]
    const area = [0, 0, 10, 10]

    expect(point.clip(area)).toEqual([10, 10])
  })

  it('이미 영역 내에 있는 점은 그대로 반환한다', () => {
    const point = [5, 5]
    const area = [0, 0, 10, 10]

    expect(point.clip(area)).toEqual([5, 5])
  })

  it('영역 밖 아래쪽 점을 클립한다', () => {
    const point = [-5, -5]
    const area = [0, 0, 10, 10]

    expect(point.clip(area)).toEqual([0, 0])
  })

  it('잘못된 길이에서 에러를 던진다', () => {
    const point = [5, 5, 5]
    const area = [0, 0, 10, 10]

    expect(() => point.clip(area)).toThrow()
  })
})

describe('Array.prototype.enlarge', () => {
  it('영역을 확대한다', () => {
    const area = [10, 10, 10, 10]
    const size = [2, 2]

    const result = area.enlarge(size)

    expect(result[2]).toBeGreaterThan(10)
    expect(result[3]).toBeGreaterThan(10)
  })

  it('anchor를 지정하여 확대할 수 있다', () => {
    const area = [10, 10, 10, 10]
    const size = [4, 4]
    const anchor = [0, 0]

    const result = area.enlarge(size, anchor)

    expect(result[0]).toBe(10)
    expect(result[1]).toBe(10)
  })

  it('잘못된 길이에서 에러를 던진다', () => {
    const area = [10, 10, 10]
    const size = [2, 2]

    expect(() => area.enlarge(size)).toThrow()
  })

  it('size와 anchor 길이가 다르면 에러를 던진다', () => {
    const area = [10, 10, 10, 10]
    const size = [2, 2]
    const anchor = [0.5]

    expect(() => area.enlarge(size, anchor)).toThrow()
  })
})

describe('Array.prototype.shrink', () => {
  it('영역을 축소한다', () => {
    const area = [10, 10, 20, 20]
    const size = [4, 4]

    const result = area.shrink(size)

    expect(result[2]).toBeLessThan(20)
    expect(result[3]).toBeLessThan(20)
  })

  it('anchor를 지정하여 축소할 수 있다', () => {
    const area = [10, 10, 20, 20]
    const size = [4, 4]
    const anchor = [0, 0]

    const result = area.shrink(size, anchor)

    expect(result[0]).toBe(10)
    expect(result[1]).toBe(10)
  })

  it('잘못된 길이에서 에러를 던진다', () => {
    const area = [10, 10, 10]
    const size = [2, 2]

    expect(() => area.shrink(size)).toThrow()
  })
})

describe('Array.prototype.align', () => {
  it('음수 크기를 양수로 정렬한다', () => {
    const area = [10, 10, -5, -5]

    expect(area.align()).toEqual([5, 5, 5, 5])
  })

  it('양수 크기는 그대로 유지한다', () => {
    const area = [10, 10, 5, 5]

    expect(area.align()).toEqual([10, 10, 5, 5])
  })
})
