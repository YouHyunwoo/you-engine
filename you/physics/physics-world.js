// you/physics/physics-world.js
import { Rigidbody } from './rigidbody.js'
import { BoxCollider, CircleCollider } from './collider.js'
import {
  testAABB,
  testCircleCircle,
  testBoxCircle,
  getAABBContact,
  getCircleContact,
  getBoxCircleContact
} from './collision.js'

export class PhysicsWorld {
  constructor({
    gravity = [0, 980]
  } = {}) {
    this.gravity = [...gravity]
    this._colliders = []
  }

  get colliders() {
    return [...this._colliders]
  }

  /**
   * 콜라이더 등록
   */
  add(collider) {
    if (!this._colliders.includes(collider)) {
      this._colliders.push(collider)
    }
  }

  /**
   * 콜라이더 제거
   */
  remove(collider) {
    const index = this._colliders.indexOf(collider)
    if (index !== -1) {
      this._colliders.splice(index, 1)
    }
  }

  /**
   * 물리 시뮬레이션 업데이트
   */
  update(deltaTime) {
    // 1. 물리 적분 (dynamic만)
    for (const collider of this._colliders) {
      if (collider.isDynamic) {
        const rb = collider.object?.findComponent?.(Rigidbody)
        if (rb && collider.object) {
          rb.integrate(collider.object.position, deltaTime, this.gravity)
        }
      }
    }

    // 2. 충돌 감지 및 해결
    this._detectAndResolveCollisions()
  }

  /**
   * 충돌 감지 및 해결
   */
  _detectAndResolveCollisions() {
    const colliders = this._colliders
    const currentCollisions = new Set()

    for (let i = 0; i < colliders.length; i++) {
      for (let j = i + 1; j < colliders.length; j++) {
        const a = colliders[i]
        const b = colliders[j]

        // static vs static은 검사 안 함
        if (a.isStatic && b.isStatic) continue

        const collision = this._testCollision(a, b)
        if (collision) {
          const pairKey = this._getPairKey(a, b)
          currentCollisions.add(pairKey)

          // 충돌 이벤트
          a._onCollisionEnter(b, collision.contact)
          b._onCollisionEnter(a, collision.contact)

          // 물리 해결 (trigger가 아닌 경우)
          if (!a.isTrigger && !b.isTrigger) {
            this._resolveCollision(a, b, collision.contact)
          }
        }
      }
    }

    // 충돌 종료 이벤트
    for (const collider of colliders) {
      for (const other of collider._collidingWith) {
        const pairKey = this._getPairKey(collider, other)
        if (!currentCollisions.has(pairKey)) {
          collider._onCollisionExit(other)
        }
      }
    }
  }

  /**
   * 두 콜라이더 충돌 테스트
   */
  _testCollision(a, b) {
    const aIsBox = a instanceof BoxCollider
    const bIsBox = b instanceof BoxCollider
    const aIsCircle = a instanceof CircleCollider
    const bIsCircle = b instanceof CircleCollider

    if (aIsBox && bIsBox) {
      const boundsA = a.getBounds()
      const boundsB = b.getBounds()
      if (testAABB(boundsA, boundsB)) {
        return { contact: getAABBContact(boundsA, boundsB) }
      }
    } else if (aIsCircle && bIsCircle) {
      const circleA = a.getCircle()
      const circleB = b.getCircle()
      if (testCircleCircle(circleA, circleB)) {
        return { contact: getCircleContact(circleA, circleB) }
      }
    } else if (aIsBox && bIsCircle) {
      const box = a.getBounds()
      const circle = b.getCircle()
      if (testBoxCircle(box, circle)) {
        return { contact: getBoxCircleContact(box, circle) }
      }
    } else if (aIsCircle && bIsBox) {
      const circle = a.getCircle()
      const box = b.getBounds()
      if (testBoxCircle(box, circle)) {
        const contact = getBoxCircleContact(box, circle)
        // 법선 방향 반전
        contact.normal = [-contact.normal[0], -contact.normal[1]]
        return { contact }
      }
    }

    return null
  }

  /**
   * 충돌 해결 (위치 보정 및 속도 반영)
   */
  _resolveCollision(a, b, contact) {
    const rbA = a.object?.findComponent?.(Rigidbody)
    const rbB = b.object?.findComponent?.(Rigidbody)

    // 위치 보정
    const { normal, depth } = contact

    if (a.isDynamic && b.isDynamic) {
      // 둘 다 dynamic이면 절반씩 밀어냄
      const half = depth / 2
      if (a.object) {
        a.object.position[0] += normal[0] * half
        a.object.position[1] += normal[1] * half
      }
      if (b.object) {
        b.object.position[0] -= normal[0] * half
        b.object.position[1] -= normal[1] * half
      }
    } else if (a.isDynamic) {
      // a만 dynamic
      if (a.object) {
        a.object.position[0] += normal[0] * depth
        a.object.position[1] += normal[1] * depth
      }
    } else if (b.isDynamic) {
      // b만 dynamic
      if (b.object) {
        b.object.position[0] -= normal[0] * depth
        b.object.position[1] -= normal[1] * depth
      }
    }

    // 속도 반영 (반발 계수)
    if (rbA && a.isDynamic) {
      const bounce = rbB ? Math.max(rbA.bounce, rbB.bounce) : rbA.bounce
      const dot = rbA.velocity[0] * normal[0] + rbA.velocity[1] * normal[1]
      if (dot < 0) {
        rbA.velocity[0] -= (1 + bounce) * dot * normal[0]
        rbA.velocity[1] -= (1 + bounce) * dot * normal[1]
      }
    }

    if (rbB && b.isDynamic) {
      const bounce = rbA ? Math.max(rbA.bounce, rbB.bounce) : rbB.bounce
      const dot = rbB.velocity[0] * (-normal[0]) + rbB.velocity[1] * (-normal[1])
      if (dot < 0) {
        rbB.velocity[0] -= (1 + bounce) * dot * (-normal[0])
        rbB.velocity[1] -= (1 + bounce) * dot * (-normal[1])
      }
    }
  }

  /**
   * 충돌 쌍 키 생성
   */
  _getPairKey(a, b) {
    const idA = this._colliders.indexOf(a)
    const idB = this._colliders.indexOf(b)
    return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`
  }
}
