import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnimatedSprite } from '../you/graphics/animated-sprite.js'

// Mock sheet
const createMockSheet = (width = 128, height = 64) => ({
  width,
  height,
  size: [width, height],
  loaded: true,
  render: vi.fn(),
})

describe('AnimatedSprite', () => {
  let sheet

  beforeEach(() => {
    sheet = createMockSheet()
  })

  describe('생성자', () => {
    it('여러 애니메이션으로 생성할 수 있다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
          walk: { grid: { cols: 4, rows: 2, start: 4, count: 4 }, fps: 12 },
        },
      })

      expect(sprite).toBeDefined()
    })

    it('default 애니메이션을 설정할 수 있다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
        },
        default: 'idle',
      })

      expect(sprite.current).toBe('idle')
    })

    it('scale과 anchor를 설정할 수 있다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        scale: [2, 2],
        anchor: [0.5, 0.5],
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
        },
      })

      expect(sprite.scale).toEqual([2, 2])
      expect(sprite.anchor).toEqual([0.5, 0.5])
    })

    it('sheet가 없으면 에러를 던진다', () => {
      expect(() => new AnimatedSprite({
        animations: { idle: { grid: { cols: 4, start: 0, count: 4 } } },
      })).toThrow()
    })

    it('animations가 없으면 에러를 던진다', () => {
      expect(() => new AnimatedSprite({ sheet })).toThrow()
    })
  })
})
