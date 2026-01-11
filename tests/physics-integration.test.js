// tests/physics-integration.test.js
import { describe, it, expect, vi } from 'vitest'
import { PhysicsWorld } from '../you/physics/physics-world.js'
import { Rigidbody } from '../you/physics/rigidbody.js'
import { BoxCollider, CircleCollider } from '../you/physics/collider.js'

function createMockObject(position, components = []) {
  const obj = {
    position: [...position],
    components: [...components],
    findComponent(type) {
      return this.components.find(c => c instanceof type)
    }
  }
  components.forEach(c => c.object = obj)
  return obj
}

describe('물리 시스템 통합 테스트', () => {
  describe('자유 낙하', () => {
    it('중력에 의해 물체가 떨어짐', () => {
      const world = new PhysicsWorld({ gravity: [0, 980] })

      const rb = new Rigidbody()
      const collider = new BoxCollider({ size: [32, 32], type: 'dynamic' })
      const obj = createMockObject([100, 0], [rb, collider])

      world.add(collider)

      // 1초 시뮬레이션
      for (let i = 0; i < 60; i++) {
        world.update(1 / 60)
      }

      // 아래로 떨어짐
      expect(obj.position[1]).toBeGreaterThan(400)
    })
  })

  describe('바닥 충돌', () => {
    it('dynamic 물체가 static 바닥에 멈춤', () => {
      const world = new PhysicsWorld({ gravity: [0, 980] })

      // 떨어지는 물체
      const rb = new Rigidbody({ bounce: 0 })
      const fallingCollider = new BoxCollider({ size: [32, 32], type: 'dynamic' })
      const fallingObj = createMockObject([100, 0], [rb, fallingCollider])

      // 바닥
      const groundCollider = new BoxCollider({ size: [800, 50], type: 'static' })
      createMockObject([0, 500], [groundCollider])

      world.add(fallingCollider)
      world.add(groundCollider)

      // 2초 시뮬레이션
      for (let i = 0; i < 120; i++) {
        world.update(1 / 60)
      }

      // 바닥 위에 멈춤 (500 - 32 = 468 근처)
      expect(fallingObj.position[1]).toBeLessThanOrEqual(470)
      expect(fallingObj.position[1]).toBeGreaterThan(400)
    })

    it('반발 계수에 따라 튕김', () => {
      const world = new PhysicsWorld({ gravity: [0, 980] })

      const rb = new Rigidbody({ bounce: 0.8 })
      const ballCollider = new CircleCollider({ radius: 16, type: 'dynamic' })
      const ball = createMockObject([100, 0], [rb, ballCollider])

      const groundCollider = new BoxCollider({ size: [800, 50], type: 'static' })
      createMockObject([0, 500], [groundCollider])

      world.add(ballCollider)
      world.add(groundCollider)

      let maxHeight = 0
      let hitGround = false

      for (let i = 0; i < 180; i++) {
        world.update(1 / 60)

        if (ball.position[1] >= 480 && !hitGround) {
          hitGround = true
        }

        if (hitGround && rb.velocity[1] < 0) {
          maxHeight = Math.max(maxHeight, 500 - ball.position[1])
        }
      }

      // 튕겨서 올라감
      expect(maxHeight).toBeGreaterThan(100)
    })
  })

  describe('트리거', () => {
    it('trigger 영역 진입 시 이벤트 발생', () => {
      const world = new PhysicsWorld({ gravity: [0, 0] })

      const rb = new Rigidbody({ velocity: [100, 0] })
      const playerCollider = new BoxCollider({ size: [32, 32], type: 'dynamic' })
      createMockObject([0, 100], [rb, playerCollider])

      const coinCollider = new CircleCollider({ radius: 16, type: 'trigger' })
      createMockObject([100, 100], [coinCollider])

      const triggerHandler = vi.fn()
      coinCollider.event.on('triggerEnter', triggerHandler)

      world.add(playerCollider)
      world.add(coinCollider)

      // 1초 시뮬레이션 (플레이어가 코인 위치로 이동)
      for (let i = 0; i < 60; i++) {
        world.update(1 / 60)
      }

      expect(triggerHandler).toHaveBeenCalled()
    })
  })

  describe('힘 적용', () => {
    it('점프 (applyImpulse)', () => {
      const world = new PhysicsWorld({ gravity: [0, 980] })

      const rb = new Rigidbody()
      const collider = new BoxCollider({ size: [32, 64], type: 'dynamic' })
      const player = createMockObject([100, 400], [rb, collider])

      world.add(collider)

      // 점프!
      rb.applyImpulse([0, -500])

      // 초기 상승
      world.update(0.1)
      expect(player.position[1]).toBeLessThan(400)
    })

    it('지속적인 힘 (applyForce)', () => {
      const world = new PhysicsWorld({ gravity: [0, 0] })

      const rb = new Rigidbody()
      const collider = new BoxCollider({ size: [32, 32], type: 'dynamic' })
      const obj = createMockObject([0, 0], [rb, collider])

      world.add(collider)

      // 매 프레임 힘 적용
      for (let i = 0; i < 60; i++) {
        rb.applyForce([100, 0])
        world.update(1 / 60)
      }

      // 오른쪽으로 이동
      expect(obj.position[0]).toBeGreaterThan(0)
    })
  })

  describe('레이캐스트', () => {
    it('벽 감지', () => {
      const world = new PhysicsWorld()

      const wallCollider = new BoxCollider({ size: [50, 200], type: 'static' })
      createMockObject([200, 100], [wallCollider])

      world.add(wallCollider)

      // 왼쪽에서 오른쪽으로 레이캐스트
      const result = world.raycast([0, 150], [1, 0], 500)

      expect(result.hit).toBe(true)
      expect(result.collider).toBe(wallCollider)
      expect(result.distance).toBeCloseTo(200, 0)
    })

    it('대각선 레이캐스트', () => {
      const world = new PhysicsWorld()

      const targetCollider = new CircleCollider({ radius: 20, type: 'static' })
      createMockObject([100, 100], [targetCollider])

      world.add(targetCollider)

      // 대각선 방향
      const dir = [1 / Math.sqrt(2), 1 / Math.sqrt(2)]
      const result = world.raycast([0, 0], dir, 200)

      expect(result.hit).toBe(true)
    })
  })
})
