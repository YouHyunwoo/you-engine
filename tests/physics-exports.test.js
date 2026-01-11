// tests/physics-exports.test.js
import { describe, it, expect } from 'vitest'
import {
  Rigidbody,
  Collider,
  BoxCollider,
  CircleCollider,
  PolygonCollider,
  PhysicsWorld,
  testAABB
} from '../you/physics/index.js'

describe('물리 시스템 내보내기', () => {
  it('모든 클래스가 내보내짐', () => {
    expect(Rigidbody).toBeDefined()
    expect(Collider).toBeDefined()
    expect(BoxCollider).toBeDefined()
    expect(CircleCollider).toBeDefined()
    expect(PolygonCollider).toBeDefined()
    expect(PhysicsWorld).toBeDefined()
    expect(testAABB).toBeDefined()
  })
})
