// tests/rigidbody.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { Rigidbody } from '../you/physics/rigidbody.js'

describe('Rigidbody', () => {
  describe('생성자', () => {
    it('기본값으로 생성', () => {
      const rb = new Rigidbody()

      expect(rb.velocity).toEqual([0, 0])
      expect(rb.acceleration).toEqual([0, 0])
      expect(rb.gravity).toBe(null)
      expect(rb.mass).toBe(1)
      expect(rb.friction).toBe(0)
      expect(rb.bounce).toBe(0)
      expect(rb.maxVelocity).toBe(null)
    })

    it('옵션으로 생성', () => {
      const rb = new Rigidbody({
        velocity: [10, 20],
        mass: 2,
        friction: 0.1,
        bounce: 0.5,
        maxVelocity: 100
      })

      expect(rb.velocity).toEqual([10, 20])
      expect(rb.mass).toBe(2)
      expect(rb.friction).toBe(0.1)
      expect(rb.bounce).toBe(0.5)
      expect(rb.maxVelocity).toBe(100)
    })
  })

  describe('applyForce', () => {
    it('힘 적용 시 가속도에 누적', () => {
      const rb = new Rigidbody({ mass: 2 })

      rb.applyForce([10, 20])

      // F = ma, a = F/m
      expect(rb.acceleration).toEqual([5, 10])
    })

    it('여러 힘을 적용하면 누적', () => {
      const rb = new Rigidbody({ mass: 1 })

      rb.applyForce([10, 0])
      rb.applyForce([0, 10])

      expect(rb.acceleration).toEqual([10, 10])
    })
  })

  describe('applyImpulse', () => {
    it('충격 적용 시 속도 즉시 변화', () => {
      const rb = new Rigidbody({ mass: 2, velocity: [0, 0] })

      rb.applyImpulse([20, 40])

      // J = mv, v = J/m
      expect(rb.velocity).toEqual([10, 20])
    })
  })

  describe('integrate', () => {
    it('속도와 위치 업데이트', () => {
      const rb = new Rigidbody({
        velocity: [100, 0],
        acceleration: [0, 0]
      })

      const position = [0, 0]
      rb.integrate(position, 0.1)

      expect(position[0]).toBe(10) // 100 * 0.1
      expect(position[1]).toBe(0)
    })

    it('가속도가 속도에 영향', () => {
      const rb = new Rigidbody({
        velocity: [0, 0],
        acceleration: [100, 0]
      })

      const position = [0, 0]
      rb.integrate(position, 0.1)

      expect(rb.velocity[0]).toBe(10) // 100 * 0.1
    })

    it('중력 적용', () => {
      const rb = new Rigidbody({
        velocity: [0, 0],
        gravity: [0, 980]
      })

      const position = [0, 0]
      rb.integrate(position, 0.1)

      expect(rb.velocity[1]).toBe(98) // 980 * 0.1
    })

    it('maxVelocity 제한', () => {
      const rb = new Rigidbody({
        velocity: [1000, 0],
        maxVelocity: 100
      })

      const position = [0, 0]
      rb.integrate(position, 0.1)

      expect(rb.velocity[0]).toBe(100)
    })

    it('마찰 적용', () => {
      const rb = new Rigidbody({
        velocity: [100, 0],
        friction: 0.1
      })

      const position = [0, 0]
      rb.integrate(position, 1)

      expect(rb.velocity[0]).toBeLessThan(100)
    })

    it('가속도 리셋', () => {
      const rb = new Rigidbody()
      rb.applyForce([100, 100])

      const position = [0, 0]
      rb.integrate(position, 0.1)

      expect(rb.acceleration).toEqual([0, 0])
    })
  })
})
