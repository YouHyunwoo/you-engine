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

  describe('재생 제어', () => {
    it('play()로 재생을 시작한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      animation.play()

      expect(animation.playing).toBe(true)
    })

    it('pause()로 일시 정지한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      animation.play()
      animation.pause()

      expect(animation.playing).toBe(false)
    })

    it('stop()으로 정지하고 처음으로 돌아간다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
      })

      animation.play()
      animation._currentFrame = 1
      animation.stop()

      expect(animation.playing).toBe(false)
      expect(animation.currentFrame).toBe(0)
    })
  })

  describe('update()', () => {
    it('fps에 따라 프레임이 진행된다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32], [64, 0, 32, 32]],
        fps: 10, // 100ms per frame
      })

      animation.play()
      animation.update(100) // 100ms = 1 frame

      expect(animation.currentFrame).toBe(1)
    })

    it('재생 중이 아니면 프레임이 진행되지 않는다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
      })

      animation.update(100)

      expect(animation.currentFrame).toBe(0)
    })

    it('loop=true면 마지막 프레임 후 처음으로 돌아간다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: true,
      })

      animation.play()
      animation._currentFrame = 1
      animation.update(100) // 마지막 프레임에서 다음으로

      expect(animation.currentFrame).toBe(0)
    })

    it('loop=false면 마지막 프레임에서 멈추고 complete 이벤트를 발생시킨다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: false,
      })
      const completeListener = vi.fn()
      animation.event.on('complete', completeListener)

      animation.play()
      animation._currentFrame = 1
      animation.update(100)

      expect(animation.currentFrame).toBe(1)
      expect(animation.playing).toBe(false)
      expect(completeListener).toHaveBeenCalled()
    })

    it('loop=true면 loopComplete 이벤트를 발생시킨다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: true,
      })
      const loopCompleteListener = vi.fn()
      animation.event.on('loopComplete', loopCompleteListener)

      animation.play()
      animation._currentFrame = 1
      animation.update(100)

      expect(loopCompleteListener).toHaveBeenCalled()
    })

    it('프레임 변경 시 frameChange 이벤트를 발생시킨다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
      })
      const frameChangeListener = vi.fn()
      animation.event.on('frameChange', frameChangeListener)

      animation.play()
      animation.update(100)

      expect(frameChangeListener).toHaveBeenCalledWith(1)
    })
  })

  describe('render()', () => {
    it('현재 프레임의 영역을 sprite에 설정하고 render를 호출한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
      })
      const mockContext = {}

      animation.render(mockContext, 100, 200)

      expect(sprite.croppingArea).toEqual([0, 0, 32, 32])
      expect(sprite.render).toHaveBeenCalledWith(mockContext, 100, 200)
    })

    it('다른 프레임에서는 해당 프레임의 영역을 설정한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
      })
      const mockContext = {}
      animation._currentFrame = 1

      animation.render(mockContext, 100, 200)

      expect(sprite.croppingArea).toEqual([32, 0, 32, 32])
    })
  })
})
