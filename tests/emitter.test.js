import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../you/math/vector.js'
import { ParticleEmitter } from '../you/particle/emitter.js'

describe('ParticleEmitter', () => {
  describe('생성자', () => {
    it('기본값으로 생성할 수 있다', () => {
      const emitter = new ParticleEmitter()

      expect(emitter.position).toEqual([0, 0])
      expect(emitter.rate).toBe(10)
      expect(emitter.maxParticles).toBe(100)
      expect(emitter.running).toBe(false)
    })

    it('옵션으로 생성할 수 있다', () => {
      const emitter = new ParticleEmitter({
        position: [100, 200],
        rate: 20,
        maxParticles: 50,
      })

      expect(emitter.position).toEqual([100, 200])
      expect(emitter.rate).toBe(20)
      expect(emitter.maxParticles).toBe(50)
    })
  })

  describe('start() / stop()', () => {
    it('start()로 연속 생성을 시작한다', () => {
      const emitter = new ParticleEmitter()

      emitter.start()

      expect(emitter.running).toBe(true)
    })

    it('stop()으로 생성을 중지한다', () => {
      const emitter = new ParticleEmitter()

      emitter.start()
      emitter.stop()

      expect(emitter.running).toBe(false)
    })

    it('start 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter()
      const handler = vi.fn()
      emitter.event.on('start', handler)

      emitter.start()

      expect(handler).toHaveBeenCalled()
    })

    it('stop 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter()
      const handler = vi.fn()
      emitter.event.on('stop', handler)

      emitter.start()
      emitter.stop()

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('burst()', () => {
    it('한 번에 여러 파티클을 생성한다', () => {
      const emitter = new ParticleEmitter({ maxParticles: 100 })

      emitter.burst(10)

      expect(emitter.particleCount).toBe(10)
    })

    it('maxParticles를 초과하지 않는다', () => {
      const emitter = new ParticleEmitter({ maxParticles: 5 })

      emitter.burst(10)

      expect(emitter.particleCount).toBe(5)
    })
  })

  describe('clear() / reset()', () => {
    it('clear()로 모든 파티클을 즉시 제거한다', () => {
      const emitter = new ParticleEmitter()

      emitter.burst(10)
      emitter.clear()

      expect(emitter.particleCount).toBe(0)
    })

    it('reset()으로 이미터를 초기화한다', () => {
      const emitter = new ParticleEmitter({ duration: 1 })

      emitter.start()
      emitter.burst(10)
      emitter.reset()

      expect(emitter.particleCount).toBe(0)
      expect(emitter.running).toBe(false)
    })
  })

  describe('setPosition() / setRate()', () => {
    it('setPosition()으로 위치를 변경한다', () => {
      const emitter = new ParticleEmitter({ position: [0, 0] })

      emitter.setPosition(100, 200)

      expect(emitter.position).toEqual([100, 200])
    })

    it('setRate()으로 생성률을 변경한다', () => {
      const emitter = new ParticleEmitter({ rate: 10 })

      emitter.setRate(20)

      expect(emitter.rate).toBe(20)
    })
  })
})
