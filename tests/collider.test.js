// tests/collider.test.js
import { describe, it, expect, vi } from 'vitest'
import { Collider, BoxCollider } from '../you/physics/collider.js'

describe('Collider', () => {
  describe('생성자', () => {
    it('기본값으로 생성', () => {
      const collider = new BoxCollider({ size: [10, 10] })

      expect(collider.offset).toEqual([0, 0])
      expect(collider.type).toBe('dynamic')
    })

    it('옵션으로 생성', () => {
      const collider = new BoxCollider({
        size: [32, 64],
        offset: [5, 10],
        type: 'static'
      })

      expect(collider.offset).toEqual([5, 10])
      expect(collider.type).toBe('static')
    })
  })

  describe('type 속성', () => {
    it('static은 물리 영향 안 받음', () => {
      const collider = new BoxCollider({ size: [10, 10], type: 'static' })
      expect(collider.isStatic).toBe(true)
      expect(collider.isDynamic).toBe(false)
    })

    it('dynamic은 물리 영향 받음', () => {
      const collider = new BoxCollider({ size: [10, 10], type: 'dynamic' })
      expect(collider.isStatic).toBe(false)
      expect(collider.isDynamic).toBe(true)
    })

    it('kinematic은 코드로 움직임', () => {
      const collider = new BoxCollider({ size: [10, 10], type: 'kinematic' })
      expect(collider.isKinematic).toBe(true)
    })

    it('trigger는 충돌 감지만', () => {
      const collider = new BoxCollider({ size: [10, 10], type: 'trigger' })
      expect(collider.isTrigger).toBe(true)
    })
  })
})

describe('BoxCollider', () => {
  describe('생성자', () => {
    it('size 필수', () => {
      const collider = new BoxCollider({ size: [32, 64] })
      expect(collider.size).toEqual([32, 64])
    })
  })

  describe('getBounds', () => {
    it('월드 좌표 기준 경계 반환', () => {
      const collider = new BoxCollider({
        size: [32, 64],
        offset: [0, 0]
      })
      collider.object = { position: [100, 200] }

      const bounds = collider.getBounds()

      expect(bounds.x).toBe(100)
      expect(bounds.y).toBe(200)
      expect(bounds.width).toBe(32)
      expect(bounds.height).toBe(64)
    })

    it('offset 적용', () => {
      const collider = new BoxCollider({
        size: [32, 64],
        offset: [10, 20]
      })
      collider.object = { position: [100, 200] }

      const bounds = collider.getBounds()

      expect(bounds.x).toBe(110)
      expect(bounds.y).toBe(220)
    })
  })

  describe('이벤트', () => {
    it('collisionEnter 이벤트 발생', () => {
      const collider = new BoxCollider({ size: [10, 10] })
      const handler = vi.fn()

      collider.event.on('collisionEnter', handler)
      collider.event.emit('collisionEnter', {}, { point: [0, 0], normal: [1, 0], depth: 1 })

      expect(handler).toHaveBeenCalled()
    })

    it('triggerEnter 이벤트 발생', () => {
      const collider = new BoxCollider({ size: [10, 10], type: 'trigger' })
      const handler = vi.fn()

      collider.event.on('triggerEnter', handler)
      collider.event.emit('triggerEnter', {})

      expect(handler).toHaveBeenCalled()
    })
  })
})
