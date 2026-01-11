import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../you/math/vector.js'
import { ParticleSystem } from '../you/particle/particle-system.js'
import { ParticleEmitter } from '../you/particle/emitter.js'

describe('ParticleSystem', () => {
  describe('add() / remove() / get()', () => {
    it('이미터를 추가할 수 있다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()

      system.add('explosion', emitter)

      expect(system.get('explosion')).toBe(emitter)
    })

    it('이미터를 제거할 수 있다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()

      system.add('explosion', emitter)
      system.remove('explosion')

      expect(system.get('explosion')).toBeUndefined()
    })
  })

  describe('play()', () => {
    it('특정 위치에서 이미터를 재생한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter({ rate: 0 })

      system.add('explosion', emitter)
      system.play('explosion', [100, 200])

      expect(emitter.position).toEqual([100, 200])
    })

    it('burst 옵션으로 파티클을 생성한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter({ rate: 0, maxParticles: 100 })

      system.add('explosion', emitter)
      system.play('explosion', [0, 0], { burst: 50 })

      expect(emitter.particleCount).toBe(50)
    })

    it('burst 없이 호출하면 start()를 호출한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter({ rate: 10 })

      system.add('smoke', emitter)
      system.play('smoke')

      expect(emitter.running).toBe(true)
    })
  })

  describe('stop() / stopAll()', () => {
    it('특정 이미터를 정지한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()

      system.add('smoke', emitter)
      system.play('smoke')
      system.stop('smoke')

      expect(emitter.running).toBe(false)
    })

    it('모든 이미터를 정지한다', () => {
      const system = new ParticleSystem()
      const emitter1 = new ParticleEmitter()
      const emitter2 = new ParticleEmitter()

      system.add('a', emitter1)
      system.add('b', emitter2)
      system.play('a')
      system.play('b')

      system.stopAll()

      expect(emitter1.running).toBe(false)
      expect(emitter2.running).toBe(false)
    })
  })

  describe('update() / render()', () => {
    it('모든 이미터를 업데이트한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()
      vi.spyOn(emitter, 'update')

      system.add('test', emitter)
      system.update(0.016)

      expect(emitter.update).toHaveBeenCalledWith(0.016)
    })

    it('모든 이미터를 렌더링한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()
      vi.spyOn(emitter, 'render')

      system.add('test', emitter)
      const mockContext = {
        save: vi.fn(),
        restore: vi.fn(),
        globalCompositeOperation: 'source-over',
      }
      system.render(mockContext)

      expect(emitter.render).toHaveBeenCalledWith(mockContext)
    })
  })

  describe('totalParticleCount', () => {
    it('모든 이미터의 파티클 수를 합산한다', () => {
      const system = new ParticleSystem()
      const emitter1 = new ParticleEmitter({ maxParticles: 100 })
      const emitter2 = new ParticleEmitter({ maxParticles: 100 })

      system.add('a', emitter1)
      system.add('b', emitter2)

      emitter1.burst(10)
      emitter2.burst(20)

      expect(system.totalParticleCount).toBe(30)
    })
  })
})
