import { describe, it, expect } from 'vitest'
import { Screen } from '../you/framework/screen.js'

describe('Screen', () => {
  describe('constructor', () => {
    it('id와 size로 초기화한다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.id).toBe('main')
      expect(screen.width).toBe(800)
      expect(screen.height).toBe(600)
    })
  })

  describe('width/height getter/setter', () => {
    it('width를 가져오고 설정한다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.width).toBe(800)
      screen.width = 1024
      expect(screen.width).toBe(1024)
    })

    it('height를 가져오고 설정한다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.height).toBe(600)
      screen.height = 768
      expect(screen.height).toBe(768)
    })
  })

  describe('size getter/setter', () => {
    it('size를 가져온다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.size).toEqual([800, 600])
    })

    it('size를 설정한다', () => {
      const screen = new Screen('main', [800, 600])

      screen.size = [1920, 1080]

      expect(screen.width).toBe(1920)
      expect(screen.height).toBe(1080)
    })
  })
})
