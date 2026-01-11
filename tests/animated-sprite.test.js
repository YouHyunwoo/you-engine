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

  describe('play()', () => {
    it('특정 애니메이션을 재생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
          walk: { grid: { cols: 4, rows: 2, start: 4, count: 4 }, fps: 12 },
        },
        default: 'idle',
      })

      sprite.play('walk')

      expect(sprite.current).toBe('walk')
      expect(sprite.playing).toBe(true)
    })

    it('같은 애니메이션을 다시 호출해도 리셋되지 않는다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 2 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.update(100)  // frame 1
      sprite.play('idle')

      expect(sprite.currentFrame).toBe(1)
    })

    it('다른 애니메이션으로 변경하면 처음부터 시작한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 2 }, fps: 10 },
          walk: { grid: { cols: 4, rows: 2, start: 4, count: 2 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.update(100)  // frame 1
      sprite.play('walk')

      expect(sprite.currentFrame).toBe(0)
    })

    it('존재하지 않는 애니메이션을 재생하면 에러를 던진다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
        },
      })

      expect(() => sprite.play('nonexistent')).toThrow()
    })
  })

  describe('pause() / stop()', () => {
    it('pause()로 일시 정지한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.pause()

      expect(sprite.playing).toBe(false)
    })

    it('stop()으로 정지하고 처음으로 돌아간다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.update(100)
      sprite.stop()

      expect(sprite.playing).toBe(false)
      expect(sprite.currentFrame).toBe(0)
    })
  })

  describe('update() / render()', () => {
    it('update()로 프레임이 진행된다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      expect(sprite.currentFrame).toBe(0)

      sprite.update(100)

      expect(sprite.currentFrame).toBe(1)
    })

    it('render()로 현재 프레임을 렌더링한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
        },
        default: 'idle',
      })
      const mockContext = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
      }

      sprite.render(mockContext, 100, 200)

      expect(sheet.render).toHaveBeenCalled()
    })
  })

  describe('이벤트', () => {
    it('애니메이션 변경시 change 이벤트가 발생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
          walk: { grid: { cols: 4, rows: 2, start: 4, count: 4 }, fps: 12 },
        },
        default: 'idle',
      })
      const changeHandler = vi.fn()
      sprite.event.on('change', changeHandler)

      sprite.play('walk')

      expect(changeHandler).toHaveBeenCalledWith('walk')
    })

    it('프레임 변경시 frameChange 이벤트가 발생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 10 },
        },
        default: 'idle',
      })
      const frameHandler = vi.fn()
      sprite.event.on('frameChange', frameHandler)

      sprite.play('idle')
      sprite.update(100)

      expect(frameHandler).toHaveBeenCalledWith('idle', 1)
    })

    it('loop=false 완료시 complete 이벤트가 발생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          jump: { grid: { cols: 4, rows: 2, start: 0, count: 2 }, fps: 10, loop: false },
        },
      })
      const completeHandler = vi.fn()
      sprite.event.on('complete', completeHandler)

      sprite.play('jump')
      sprite.update(100)  // frame 1
      sprite.update(100)  // complete

      expect(completeHandler).toHaveBeenCalledWith('jump')
    })
  })
})
