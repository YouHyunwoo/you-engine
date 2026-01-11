import { describe, it, expect, beforeEach } from 'vitest'
import '../you/math/vector.js'
import { Particle } from '../you/particle/particle.js'

describe('Particle', () => {
  describe('생성자', () => {
    it('기본값으로 생성할 수 있다', () => {
      const particle = new Particle()

      expect(particle.position).toEqual([0, 0])
      expect(particle.velocity).toEqual([0, 0])
      expect(particle.lifetime).toBe(1)
      expect(particle.age).toBe(0)
      expect(particle.alive).toBe(true)
    })

    it('옵션으로 생성할 수 있다', () => {
      const particle = new Particle({
        position: [100, 200],
        velocity: [50, -100],
        lifetime: 2,
      })

      expect(particle.position).toEqual([100, 200])
      expect(particle.velocity).toEqual([50, -100])
      expect(particle.lifetime).toBe(2)
    })
  })

  describe('progress', () => {
    it('age / lifetime 비율을 반환한다', () => {
      const particle = new Particle({ lifetime: 2 })
      particle.age = 1

      expect(particle.progress).toBe(0.5)
    })

    it('최대 1을 반환한다', () => {
      const particle = new Particle({ lifetime: 1 })
      particle.age = 2

      expect(particle.progress).toBe(1)
    })
  })

  describe('update()', () => {
    it('속도에 따라 위치가 변한다', () => {
      const particle = new Particle({
        position: [0, 0],
        velocity: [100, 200],
        lifetime: 2,
      })

      particle.update(0.5)  // 0.5초

      expect(particle.position[0]).toBeCloseTo(50)
      expect(particle.position[1]).toBeCloseTo(100)
    })

    it('age가 증가한다', () => {
      const particle = new Particle({ lifetime: 2 })

      particle.update(0.5)

      expect(particle.age).toBe(0.5)
    })

    it('lifetime을 초과하면 alive가 false가 된다', () => {
      const particle = new Particle({ lifetime: 1 })

      particle.update(1.5)

      expect(particle.alive).toBe(false)
    })

    it('중력이 적용된다', () => {
      const particle = new Particle({
        velocity: [0, 0],
        gravity: [0, 100],
        lifetime: 2,
      })

      particle.update(1)  // 1초

      expect(particle.velocity[1]).toBeCloseTo(100)
    })

    it('마찰이 적용된다', () => {
      const particle = new Particle({
        velocity: [100, 0],
        friction: 0.5,
        lifetime: 2,
      })

      particle.update(1)

      expect(particle.velocity[0]).toBeLessThan(100)
    })
  })

  describe('reset()', () => {
    it('파티클을 초기 상태로 리셋한다', () => {
      const particle = new Particle({ lifetime: 1 })
      particle.age = 1
      particle.alive = false

      particle.reset({
        position: [50, 50],
        velocity: [10, 10],
        lifetime: 2,
      })

      expect(particle.position).toEqual([50, 50])
      expect(particle.age).toBe(0)
      expect(particle.alive).toBe(true)
    })
  })
})
