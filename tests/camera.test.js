import { describe, it, expect } from 'vitest'
import '../you/math/vector.js'
import { Camera } from '../you/camera.js'

describe('Camera', () => {
  const createMockScreen = (size = [800, 600]) => ({
    size: size.slice()
  })

  describe('constructor', () => {
    it('screen을 설정하고 position을 [0,0]으로 초기화한다', () => {
      const screen = createMockScreen()
      const camera = new Camera(screen)

      expect(camera.screen).toBe(screen)
      expect(camera.position).toEqual([0, 0])
      expect(camera.size).toEqual([800, 600])
    })
  })

  describe('scale', () => {
    it('화면 크기 / 카메라 크기를 반환한다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.size = [400, 300] // 2배 확대

      const scale = camera.scale

      expect(scale[0]).toBeCloseTo(2)
      expect(scale[1]).toBeCloseTo(2)
    })

    it('scale을 설정하면 size가 변경된다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)

      camera.scale = [2, 2]

      expect(camera.size[0]).toBeCloseTo(400)
      expect(camera.size[1]).toBeCloseTo(300)
    })
  })

  describe('toWorld()', () => {
    it('스크린 좌표를 월드 좌표로 변환한다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [100, 100]

      // 화면 중앙 (400, 300)은 카메라 위치 (100, 100)
      const world = camera.toWorld([400, 300])

      expect(world[0]).toBeCloseTo(100)
      expect(world[1]).toBeCloseTo(100)
    })

    it('화면 왼쪽 상단은 카메라 왼쪽 상단', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [0, 0]

      // 화면 좌상단 (0, 0) → 월드 (-400, -300)
      const world = camera.toWorld([0, 0])

      expect(world[0]).toBeCloseTo(-400)
      expect(world[1]).toBeCloseTo(-300)
    })
  })

  describe('toScreen()', () => {
    it('월드 좌표를 스크린 좌표로 변환한다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [100, 100]

      // 카메라 위치 (100, 100)은 화면 중앙 (400, 300)
      const screenPos = camera.toScreen([100, 100])

      expect(screenPos[0]).toBeCloseTo(400)
      expect(screenPos[1]).toBeCloseTo(300)
    })

    it('toWorld와 toScreen은 역함수 관계', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [50, 75]

      const original = [200, 150]
      const world = camera.toWorld(original)
      const back = camera.toScreen(world)

      expect(back[0]).toBeCloseTo(original[0])
      expect(back[1]).toBeCloseTo(original[1])
    })
  })
})
