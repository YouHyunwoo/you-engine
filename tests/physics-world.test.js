// tests/physics-world.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PhysicsWorld } from '../you/physics/physics-world.js'
import { BoxCollider, CircleCollider } from '../you/physics/collider.js'
import { Rigidbody } from '../you/physics/rigidbody.js'

// 가짜 Object 생성
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

describe('PhysicsWorld', () => {
  describe('생성자', () => {
    it('기본 중력 설정', () => {
      const world = new PhysicsWorld()
      expect(world.gravity).toEqual([0, 980])
    })

    it('커스텀 중력 설정', () => {
      const world = new PhysicsWorld({ gravity: [0, 500] })
      expect(world.gravity).toEqual([0, 500])
    })
  })

  describe('add/remove', () => {
    it('콜라이더 추가', () => {
      const world = new PhysicsWorld()
      const collider = new BoxCollider({ size: [10, 10] })

      world.add(collider)

      expect(world.colliders).toContain(collider)
    })

    it('콜라이더 제거', () => {
      const world = new PhysicsWorld()
      const collider = new BoxCollider({ size: [10, 10] })

      world.add(collider)
      world.remove(collider)

      expect(world.colliders).not.toContain(collider)
    })

    it('중복 추가 방지', () => {
      const world = new PhysicsWorld()
      const collider = new BoxCollider({ size: [10, 10] })

      world.add(collider)
      world.add(collider)

      expect(world.colliders.length).toBe(1)
    })
  })

  describe('update', () => {
    it('dynamic 콜라이더의 Rigidbody 업데이트', () => {
      const world = new PhysicsWorld({ gravity: [0, 100] })

      const rb = new Rigidbody({ velocity: [0, 0] })
      const collider = new BoxCollider({ size: [10, 10], type: 'dynamic' })
      const obj = createMockObject([100, 100], [rb, collider])

      world.add(collider)
      world.update(0.1)

      // 중력 적용됨
      expect(rb.velocity[1]).toBeGreaterThan(0)
    })

    it('static 콜라이더는 움직이지 않음', () => {
      const world = new PhysicsWorld({ gravity: [0, 100] })

      const collider = new BoxCollider({ size: [10, 10], type: 'static' })
      const obj = createMockObject([100, 100], [collider])

      world.add(collider)
      world.update(0.1)

      expect(obj.position).toEqual([100, 100])
    })
  })
})
