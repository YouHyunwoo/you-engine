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

  describe('lockPointer()', () => {
    it('canvas.requestPointerLock()을 호출한다', () => {
      const mockCanvas = {
        requestPointerLock: vi.fn()
      }
      const screen = { canvas: mockCanvas }
      output.addScreen('main', screen)

      output.lockPointer('main')

      expect(mockCanvas.requestPointerLock).toHaveBeenCalled()
    })

    it('pointerlockchange 이벤트에서 pointerLockElement가 canvas이면 input.lockPointer()를 호출한다', () => {
      const mockCanvas = {
        requestPointerLock: vi.fn()
      }
      const screen = { canvas: mockCanvas }
      output.addScreen('main', screen)

      output.lockPointer('main')

      // pointerLockElement를 canvas로 설정하고 이벤트 발생
      Object.defineProperty(document, 'pointerLockElement', {
        value: mockCanvas,
        configurable: true
      })

      document.dispatchEvent(new Event('pointerlockchange'))

      expect(mockEngine.input.lockPointer).toHaveBeenCalled()
    })

    it('pointerlockchange 이벤트에서 pointerLockElement가 다르면 input.unlockPointer()를 호출한다', () => {
      const mockCanvas = {
        requestPointerLock: vi.fn()
      }
      const screen = { canvas: mockCanvas }
      output.addScreen('main', screen)

      output.lockPointer('main')

      // pointerLockElement를 null로 설정하고 이벤트 발생
      Object.defineProperty(document, 'pointerLockElement', {
        value: null,
        configurable: true
      })

      document.dispatchEvent(new Event('pointerlockchange'))

      expect(mockEngine.input.unlockPointer).toHaveBeenCalled()
    })

    it('여러 번 lockPointer 호출해도 리스너는 한 번만 등록된다', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      const mockCanvas = {
        requestPointerLock: vi.fn()
      }
      const screen = { canvas: mockCanvas }
      output.addScreen('main', screen)

      output.lockPointer('main')
      output.lockPointer('main')
      output.lockPointer('main')

      const pointerLockCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'pointerlockchange'
      )

      expect(pointerLockCalls.length).toBe(1)

      addEventListenerSpy.mockRestore()
    })
  })
})
