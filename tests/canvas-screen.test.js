import { describe, it, expect, vi } from 'vitest'
import { CanvasScreen } from '../you/screen.js'

describe('CanvasScreen', () => {
  const createMockCanvas = () => {
    return {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({})),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  }

  describe('constructor', () => {
    it('canvas와 context를 설정한다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      expect(screen.canvas).toBe(canvas)
      expect(screen.context).toBeDefined()
      expect(canvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('canvas 크기를 설정한다', () => {
      const canvas = createMockCanvas()
      new CanvasScreen('main', [800, 600], canvas)

      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
    })
  })

  describe('width/height setter', () => {
    it('width 설정시 canvas.width도 변경된다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      screen.width = 1024

      expect(screen.width).toBe(1024)
      expect(canvas.width).toBe(1024)
    })

    it('height 설정시 canvas.height도 변경된다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      screen.height = 768

      expect(screen.height).toBe(768)
      expect(canvas.height).toBe(768)
    })
  })

  describe('size getter/setter', () => {
    it('size를 가져온다 (복사본 반환)', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      const size = screen.size
      size[0] = 9999

      expect(screen.width).toBe(800) // 원본 변경 안됨
    })

    it('size 설정시 canvas 크기도 변경된다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      screen.size = [1920, 1080]

      expect(canvas.width).toBe(1920)
      expect(canvas.height).toBe(1080)
    })
  })

  describe('addEventListener/removeEventListener', () => {
    it('canvas에 이벤트 리스너를 추가한다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)
      const listener = vi.fn()

      screen.addEventListener('click', listener)

      expect(canvas.addEventListener).toHaveBeenCalledWith('click', listener)
    })

    it('canvas에서 이벤트 리스너를 제거한다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)
      const listener = vi.fn()

      screen.removeEventListener('click', listener)

      expect(canvas.removeEventListener).toHaveBeenCalledWith('click', listener)
    })
  })

  describe('createOffscreen', () => {
    it('오프스크린 캔버스를 생성한다', () => {
      const screen = CanvasScreen.createOffscreen('offscreen', [400, 300])

      expect(screen).toBeInstanceOf(CanvasScreen)
      expect(screen.id).toBe('offscreen')
      expect(screen.width).toBe(400)
      expect(screen.height).toBe(300)
    })
  })
})
