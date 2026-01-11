import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpriteAnimation } from '../you/graphics/sprite-animation.js'

// Mock Sprite
const createMockSprite = (width = 128, height = 64) => ({
  sheet: { width, height, loaded: true },
  croppingArea: null,
  render: vi.fn(),
})

describe('SpriteAnimation', () => {
  let sprite

  beforeEach(() => {
    sprite = createMockSprite()
  })

  describe('생성자', () => {
    it('frames 배열로 생성할 수 있다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [
          [0, 0, 32, 32],
          [32, 0, 32, 32],
        ],
      })

      expect(animation.frameCount).toBe(2)
      expect(animation.currentFrame).toBe(0)
      expect(animation.playing).toBe(false)
    })

    it('grid 옵션으로 생성할 수 있다', () => {
      const animation = new SpriteAnimation({
        sprite,
        grid: { cols: 4, rows: 2, start: 0, count: 4 },
      })

      expect(animation.frameCount).toBe(4)
      expect(animation.frames[0]).toEqual([0, 0, 32, 32])
      expect(animation.frames[1]).toEqual([32, 0, 32, 32])
    })

    it('grid에서 rows 지정시 frameHeight를 자동 계산한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        grid: { cols: 4, rows: 2, start: 0, count: 4 },
      })

      // 128/4=32, 64/2=32
      expect(animation.frames[0]).toEqual([0, 0, 32, 32])
    })

    it('grid의 start가 다음 행이면 y 좌표가 변한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        grid: { cols: 4, rows: 2, start: 4, count: 2 },
      })

      // start=4는 두 번째 행 (index 4 = col 0, row 1)
      expect(animation.frames[0]).toEqual([0, 32, 32, 32])
      expect(animation.frames[1]).toEqual([32, 32, 32, 32])
    })

    it('fps 기본값은 12이다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      expect(animation.fps).toBe(12)
    })

    it('loop 기본값은 true이다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      expect(animation.loop).toBe(true)
    })

    it('sprite가 없으면 에러를 던진다', () => {
      expect(() => new SpriteAnimation({ frames: [[0, 0, 32, 32]] }))
        .toThrow()
    })

    it('frames와 grid 둘 다 없으면 에러를 던진다', () => {
      expect(() => new SpriteAnimation({ sprite }))
        .toThrow()
    })
  })
})
