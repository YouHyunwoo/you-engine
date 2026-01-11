import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Loop } from '../you/framework/loop.js'

describe('Loop', () => {
  let mockEngine
  let originalRAF
  let originalCAF

  beforeEach(() => {
    mockEngine = {
      applications: [],
      event: { clear: vi.fn() },
      input: {},
      output: { screens: {} }
    }

    originalRAF = window.requestAnimationFrame
    originalCAF = window.cancelAnimationFrame

    window.requestAnimationFrame = vi.fn((cb) => {
      return Math.random()
    })
    window.cancelAnimationFrame = vi.fn()
  })

  afterEach(() => {
    window.requestAnimationFrame = originalRAF
    window.cancelAnimationFrame = originalCAF
  })

  describe('stop', () => {
    it('cancelAnimationFrame을 호출한다', () => {
      const loop = new Loop(mockEngine)

      window.requestAnimationFrame.mockReturnValue(123)
      loop.start()

      // RAF 콜백 실행 시뮬레이션
      const rafCallback = window.requestAnimationFrame.mock.calls[0][0]
      rafCallback(16)

      const handleBeforeStop = loop.handle
      loop.stop()

      expect(window.cancelAnimationFrame).toHaveBeenCalledWith(handleBeforeStop)
    })

    it('stop 후 handle이 null이다', () => {
      const loop = new Loop(mockEngine)
      window.requestAnimationFrame.mockReturnValue(123)
      loop.start()

      const rafCallback = window.requestAnimationFrame.mock.calls[0][0]
      rafCallback(16)

      loop.stop()

      expect(loop.handle).toBe(null)
    })
  })
})
