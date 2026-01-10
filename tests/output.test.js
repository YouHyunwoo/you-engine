import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Output } from '../you/framework/output.js'

describe('Output', () => {
  let output
  let mockEngine

  beforeEach(() => {
    mockEngine = {
      input: {
        lockPointer: vi.fn(),
        unlockPointer: vi.fn()
      }
    }
    output = new Output(mockEngine)
  })

  describe('addScreen()', () => {
    it('스크린을 추가한다', () => {
      const screen = { id: 'main', canvas: {} }

      output.addScreen('main', screen)

      expect(output.screens['main']).toBe(screen)
    })
  })

  describe('unlockPointer()', () => {
    it('document.exitPointerLock()을 호출한다', () => {
      // jsdom에 exitPointerLock이 없으므로 먼저 정의
      document.exitPointerLock = vi.fn()

      output.unlockPointer()

      expect(document.exitPointerLock).toHaveBeenCalled()
    })
  })
})
