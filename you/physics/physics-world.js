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

  /**
   * 레이캐스트 - 광선과 콜라이더 충돌 검사
   * @param {number[]} origin - 광선 시작점 [x, y]
   * @param {number[]} direction - 광선 방향 (정규화된 벡터) [dx, dy]
   * @param {number} maxDistance - 최대 거리
   * @returns {{hit: boolean, collider?: Collider, point?: number[], normal?: number[], distance?: number}}
   */
  raycast(origin, direction, maxDistance) {
    let closestHit = { hit: false }
    let closestDistance = maxDistance

    for (const collider of this._colliders) {
      const hit = this._raycastCollider(origin, direction, collider, closestDistance)
      if (hit && hit.distance < closestDistance) {
        closestHit = hit
        closestDistance = hit.distance
      }
    }

    return closestHit
  }

  /**
   * 개별 콜라이더에 대한 레이캐스트
   */
  _raycastCollider(origin, direction, collider, maxDistance) {
    if (collider instanceof BoxCollider) {
      return this._raycastBox(origin, direction, collider.getBounds(), maxDistance, collider)
    } else if (collider instanceof CircleCollider) {
      return this._raycastCircle(origin, direction, collider.getCircle(), maxDistance, collider)
    }
    return null
  }

  /**
   * 박스에 대한 레이캐스트 (슬랩 알고리즘)
   */
  _raycastBox(origin, direction, box, maxDistance, collider) {
    const invDirX = direction[0] !== 0 ? 1 / direction[0] : Infinity
    const invDirY = direction[1] !== 0 ? 1 / direction[1] : Infinity

    const t1 = (box.x - origin[0]) * invDirX
    const t2 = (box.x + box.width - origin[0]) * invDirX
    const t3 = (box.y - origin[1]) * invDirY
    const t4 = (box.y + box.height - origin[1]) * invDirY

    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4))
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4))

    if (tmax < 0 || tmin > tmax || tmin > maxDistance) {
      return null
    }

    const t = tmin >= 0 ? tmin : tmax
    if (t > maxDistance) return null

    const point = [
      origin[0] + direction[0] * t,
      origin[1] + direction[1] * t
    ]

    // 법선 계산
    let normal
    const epsilon = 0.001
    if (Math.abs(point[0] - box.x) < epsilon) normal = [-1, 0]
    else if (Math.abs(point[0] - (box.x + box.width)) < epsilon) normal = [1, 0]
    else if (Math.abs(point[1] - box.y) < epsilon) normal = [0, -1]
    else normal = [0, 1]

    return {
      hit: true,
      collider,
      point,
      normal,
      distance: t
    }
  }

  /**
   * 원에 대한 레이캐스트
   */
  _raycastCircle(origin, direction, circle, maxDistance, collider) {
    const dx = origin[0] - circle.x
    const dy = origin[1] - circle.y

    const a = direction[0] * direction[0] + direction[1] * direction[1]
    const b = 2 * (dx * direction[0] + dy * direction[1])
    const c = dx * dx + dy * dy - circle.radius * circle.radius

    const discriminant = b * b - 4 * a * c
    if (discriminant < 0) return null

    const t = (-b - Math.sqrt(discriminant)) / (2 * a)
    if (t < 0 || t > maxDistance) return null

    const point = [
      origin[0] + direction[0] * t,
      origin[1] + direction[1] * t
    ]

    const normal = [
      (point[0] - circle.x) / circle.radius,
      (point[1] - circle.y) / circle.radius
    ]

    return {
      hit: true,
      collider,
      point,
      normal,
      distance: t
    }
  }
}
