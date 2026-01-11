# 물리 시스템 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 2D 물리 시뮬레이션 시스템 구현 (Rigidbody, Collider, PhysicsWorld)

**Architecture:** Component 기반 물리 시스템. Rigidbody가 물리 속성(속도, 질량, 마찰)을 관리하고, Collider가 충돌 영역(Box, Circle, Polygon)을 정의하며, PhysicsWorld가 전체 시뮬레이션과 충돌 감지를 담당한다.

**Tech Stack:** ES6 모듈, Component 상속, EventEmitter 패턴, SAT 알고리즘

---

## Task 1: 충돌 감지 유틸리티

충돌 감지 알고리즘들을 구현한다.

**Files:**
- Create: `you/physics/collision.js`
- Test: `tests/physics-collision.test.js`

**Step 1: 테스트 파일 생성**

```javascript
// tests/physics-collision.test.js
import { describe, it, expect } from 'vitest'
import {
  testAABB,
  testCircleCircle,
  testBoxCircle,
  getAABBContact,
  getCircleContact
} from '../you/physics/collision.js'

describe('collision utilities', () => {
  describe('testAABB', () => {
    it('두 박스가 겹치면 true 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 5, y: 5, width: 10, height: 10 }
      expect(testAABB(a, b)).toBe(true)
    })

    it('두 박스가 떨어져 있으면 false 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 20, y: 20, width: 10, height: 10 }
      expect(testAABB(a, b)).toBe(false)
    })

    it('박스가 맞닿아 있으면 false 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 10, y: 0, width: 10, height: 10 }
      expect(testAABB(a, b)).toBe(false)
    })
  })

  describe('testCircleCircle', () => {
    it('두 원이 겹치면 true 반환', () => {
      const a = { x: 0, y: 0, radius: 10 }
      const b = { x: 15, y: 0, radius: 10 }
      expect(testCircleCircle(a, b)).toBe(true)
    })

    it('두 원이 떨어져 있으면 false 반환', () => {
      const a = { x: 0, y: 0, radius: 10 }
      const b = { x: 25, y: 0, radius: 10 }
      expect(testCircleCircle(a, b)).toBe(false)
    })
  })

  describe('testBoxCircle', () => {
    it('박스와 원이 겹치면 true 반환', () => {
      const box = { x: 0, y: 0, width: 10, height: 10 }
      const circle = { x: 12, y: 5, radius: 5 }
      expect(testBoxCircle(box, circle)).toBe(true)
    })

    it('원이 박스 안에 있으면 true 반환', () => {
      const box = { x: 0, y: 0, width: 20, height: 20 }
      const circle = { x: 10, y: 10, radius: 5 }
      expect(testBoxCircle(box, circle)).toBe(true)
    })

    it('박스와 원이 떨어져 있으면 false 반환', () => {
      const box = { x: 0, y: 0, width: 10, height: 10 }
      const circle = { x: 20, y: 20, radius: 5 }
      expect(testBoxCircle(box, circle)).toBe(false)
    })
  })

  describe('getAABBContact', () => {
    it('충돌 정보 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 8, y: 0, width: 10, height: 10 }
      const contact = getAABBContact(a, b)

      expect(contact.depth).toBe(2) // 10 - 8 = 2
      expect(contact.normal[0]).toBe(-1) // a를 왼쪽으로 밀어야 함
      expect(contact.normal[1]).toBe(0)
    })
  })

  describe('getCircleContact', () => {
    it('원-원 충돌 정보 반환', () => {
      const a = { x: 0, y: 0, radius: 10 }
      const b = { x: 15, y: 0, radius: 10 }
      const contact = getCircleContact(a, b)

      expect(contact.depth).toBe(5) // 20 - 15 = 5
      expect(contact.normal[0]).toBe(-1) // a를 왼쪽으로 밀어야 함
      expect(contact.normal[1]).toBe(0)
    })
  })
})
```

**Step 2: 테스트 실패 확인**

Run: `pnpm test tests/physics-collision.test.js`
Expected: FAIL (모듈을 찾을 수 없음)

**Step 3: 충돌 유틸리티 구현**

```javascript
// you/physics/collision.js

/**
 * AABB 충돌 테스트
 * @param {{x: number, y: number, width: number, height: number}} a
 * @param {{x: number, y: number, width: number, height: number}} b
 * @returns {boolean}
 */
export function testAABB(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

/**
 * 원-원 충돌 테스트
 * @param {{x: number, y: number, radius: number}} a
 * @param {{x: number, y: number, radius: number}} b
 * @returns {boolean}
 */
export function testCircleCircle(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < a.radius + b.radius
}

/**
 * 박스-원 충돌 테스트
 * @param {{x: number, y: number, width: number, height: number}} box
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {boolean}
 */
export function testBoxCircle(box, circle) {
  // 원의 중심에서 박스까지의 최근접점 계산
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width))
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height))

  const dx = circle.x - closestX
  const dy = circle.y - closestY
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance < circle.radius
}

/**
 * AABB 충돌 정보 계산
 * @param {{x: number, y: number, width: number, height: number}} a
 * @param {{x: number, y: number, width: number, height: number}} b
 * @returns {{point: number[], normal: number[], depth: number}}
 */
export function getAABBContact(a, b) {
  // 각 축에서의 침투 깊이 계산
  const overlapX1 = (a.x + a.width) - b.x  // a의 오른쪽 - b의 왼쪽
  const overlapX2 = (b.x + b.width) - a.x  // b의 오른쪽 - a의 왼쪽
  const overlapY1 = (a.y + a.height) - b.y // a의 아래 - b의 위
  const overlapY2 = (b.y + b.height) - a.y // b의 아래 - a의 위

  // 최소 침투 축 찾기
  const minOverlapX = Math.min(overlapX1, overlapX2)
  const minOverlapY = Math.min(overlapY1, overlapY2)

  let normal, depth

  if (minOverlapX < minOverlapY) {
    depth = minOverlapX
    normal = overlapX1 < overlapX2 ? [-1, 0] : [1, 0]
  } else {
    depth = minOverlapY
    normal = overlapY1 < overlapY2 ? [0, -1] : [0, 1]
  }

  // 충돌 지점 (두 박스 중심의 중간)
  const point = [
    (a.x + a.width / 2 + b.x + b.width / 2) / 2,
    (a.y + a.height / 2 + b.y + b.height / 2) / 2
  ]

  return { point, normal, depth }
}

/**
 * 원-원 충돌 정보 계산
 * @param {{x: number, y: number, radius: number}} a
 * @param {{x: number, y: number, radius: number}} b
 * @returns {{point: number[], normal: number[], depth: number}}
 */
export function getCircleContact(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // 두 원이 같은 위치에 있는 경우
  if (distance === 0) {
    return {
      point: [a.x, a.y],
      normal: [1, 0],
      depth: a.radius + b.radius
    }
  }

  const normal = [-dx / distance, -dy / distance]
  const depth = a.radius + b.radius - distance
  const point = [
    a.x + dx / 2,
    a.y + dy / 2
  ]

  return { point, normal, depth }
}

/**
 * 박스-원 충돌 정보 계산
 * @param {{x: number, y: number, width: number, height: number}} box
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {{point: number[], normal: number[], depth: number}}
 */
export function getBoxCircleContact(box, circle) {
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width))
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height))

  const dx = circle.x - closestX
  const dy = circle.y - closestY
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) {
    // 원 중심이 박스 안에 있음
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const cdx = circle.x - centerX
    const cdy = circle.y - centerY

    if (Math.abs(cdx) > Math.abs(cdy)) {
      return {
        point: [closestX, closestY],
        normal: cdx > 0 ? [1, 0] : [-1, 0],
        depth: circle.radius + (cdx > 0 ? box.x + box.width - circle.x : circle.x - box.x)
      }
    } else {
      return {
        point: [closestX, closestY],
        normal: cdy > 0 ? [0, 1] : [0, -1],
        depth: circle.radius + (cdy > 0 ? box.y + box.height - circle.y : circle.y - box.y)
      }
    }
  }

  return {
    point: [closestX, closestY],
    normal: [-dx / distance, -dy / distance],
    depth: circle.radius - distance
  }
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm test tests/physics-collision.test.js`
Expected: PASS

**Step 5: 커밋**

```bash
git add you/physics/collision.js tests/physics-collision.test.js
git commit -m "feat: 충돌 감지 유틸리티 구현 (AABB, Circle, BoxCircle)"
```

---

## Task 2: Rigidbody 컴포넌트 기본 구조

물리 속성을 관리하는 Rigidbody 컴포넌트를 구현한다.

**Files:**
- Create: `you/physics/rigidbody.js`
- Test: `tests/rigidbody.test.js`

**Step 1: 테스트 파일 생성**

```javascript
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
```

**Step 2: 테스트 실패 확인**

Run: `pnpm test tests/rigidbody.test.js`
Expected: FAIL (모듈을 찾을 수 없음)

**Step 3: Rigidbody 구현**

```javascript
// you/physics/rigidbody.js
import { Component } from '../component.js'

export class Rigidbody extends Component {
  constructor({
    velocity = [0, 0],
    acceleration = [0, 0],
    gravity = null,
    mass = 1,
    friction = 0,
    bounce = 0,
    maxVelocity = null,
    ...options
  } = {}) {
    super(options)

    this.velocity = [...velocity]
    this.acceleration = [...acceleration]
    this.gravity = gravity
    this.mass = mass
    this.friction = friction
    this.bounce = bounce
    this.maxVelocity = maxVelocity
  }

  /**
   * 힘 적용 (F = ma, a += F/m)
   * @param {number[]} force - [fx, fy]
   */
  applyForce(force) {
    this.acceleration[0] += force[0] / this.mass
    this.acceleration[1] += force[1] / this.mass
  }

  /**
   * 충격 적용 (즉시 속도 변화)
   * @param {number[]} impulse - [jx, jy]
   */
  applyImpulse(impulse) {
    this.velocity[0] += impulse[0] / this.mass
    this.velocity[1] += impulse[1] / this.mass
  }

  /**
   * 물리 적분 (위치, 속도 업데이트)
   * @param {number[]} position - 업데이트할 위치 배열
   * @param {number} deltaTime - 시간 간격 (초)
   * @param {number[]} worldGravity - 월드 중력 (선택)
   */
  integrate(position, deltaTime, worldGravity = null) {
    // 중력 적용
    const gravity = this.gravity ?? worldGravity
    if (gravity) {
      this.velocity[0] += gravity[0] * deltaTime
      this.velocity[1] += gravity[1] * deltaTime
    }

    // 가속도 적용
    this.velocity[0] += this.acceleration[0] * deltaTime
    this.velocity[1] += this.acceleration[1] * deltaTime

    // 마찰 적용
    if (this.friction > 0) {
      const factor = 1 - this.friction * deltaTime
      this.velocity[0] *= factor
      this.velocity[1] *= factor
    }

    // 최대 속도 제한
    if (this.maxVelocity !== null) {
      const speed = Math.sqrt(
        this.velocity[0] * this.velocity[0] +
        this.velocity[1] * this.velocity[1]
      )
      if (speed > this.maxVelocity) {
        const scale = this.maxVelocity / speed
        this.velocity[0] *= scale
        this.velocity[1] *= scale
      }
    }

    // 위치 업데이트
    position[0] += this.velocity[0] * deltaTime
    position[1] += this.velocity[1] * deltaTime

    // 가속도 리셋
    this.acceleration[0] = 0
    this.acceleration[1] = 0
  }
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm test tests/rigidbody.test.js`
Expected: PASS

**Step 5: 커밋**

```bash
git add you/physics/rigidbody.js tests/rigidbody.test.js
git commit -m "feat: Rigidbody 컴포넌트 구현"
```

---

## Task 3: Collider 베이스 클래스 및 BoxCollider

충돌 영역을 정의하는 Collider와 BoxCollider를 구현한다.

**Files:**
- Create: `you/physics/collider.js`
- Test: `tests/collider.test.js`

**Step 1: 테스트 파일 생성**

```javascript
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
```

**Step 2: 테스트 실패 확인**

Run: `pnpm test tests/collider.test.js`
Expected: FAIL (모듈을 찾을 수 없음)

**Step 3: Collider 구현**

```javascript
// you/physics/collider.js
import { Component } from '../component.js'

/**
 * Collider 베이스 클래스
 */
export class Collider extends Component {
  static TYPES = ['static', 'dynamic', 'kinematic', 'trigger']

  constructor({
    offset = [0, 0],
    type = 'dynamic',
    ...options
  } = {}) {
    super(options)

    this.offset = [...offset]
    this._type = type

    // 충돌 상태 추적
    this._collidingWith = new Set()
  }

  get type() { return this._type }
  set type(value) {
    if (!Collider.TYPES.includes(value)) {
      throw new Error(`Invalid collider type: ${value}`)
    }
    this._type = value
  }

  get isStatic() { return this._type === 'static' }
  get isDynamic() { return this._type === 'dynamic' }
  get isKinematic() { return this._type === 'kinematic' }
  get isTrigger() { return this._type === 'trigger' }

  /**
   * 월드 좌표 기준 경계 반환 (서브클래스에서 구현)
   */
  getBounds() {
    throw new Error('getBounds must be implemented by subclass')
  }

  /**
   * 충돌 시작 처리
   */
  _onCollisionEnter(other, contact) {
    if (!this._collidingWith.has(other)) {
      this._collidingWith.add(other)

      if (this.isTrigger || other.isTrigger) {
        this.event.emit('triggerEnter', other)
      } else {
        this.event.emit('collisionEnter', other, contact)
      }
    }
  }

  /**
   * 충돌 지속 처리
   */
  _onCollisionStay(other, contact) {
    if (this._collidingWith.has(other)) {
      if (!this.isTrigger && !other.isTrigger) {
        this.event.emit('collisionStay', other, contact)
      }
    }
  }

  /**
   * 충돌 종료 처리
   */
  _onCollisionExit(other) {
    if (this._collidingWith.has(other)) {
      this._collidingWith.delete(other)

      if (this.isTrigger || other.isTrigger) {
        this.event.emit('triggerExit', other)
      } else {
        this.event.emit('collisionExit', other)
      }
    }
  }
}

/**
 * BoxCollider - 사각형 충돌 영역
 */
export class BoxCollider extends Collider {
  constructor({
    size,
    ...options
  } = {}) {
    super(options)

    if (!size || size.length !== 2) {
      throw new Error('BoxCollider requires size [width, height]')
    }

    this.size = [...size]
  }

  getBounds() {
    const pos = this.object?.position ?? [0, 0]
    return {
      x: pos[0] + this.offset[0],
      y: pos[1] + this.offset[1],
      width: this.size[0],
      height: this.size[1]
    }
  }
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm test tests/collider.test.js`
Expected: PASS

**Step 5: 커밋**

```bash
git add you/physics/collider.js tests/collider.test.js
git commit -m "feat: Collider 베이스 클래스 및 BoxCollider 구현"
```

---

## Task 4: CircleCollider 및 PolygonCollider

원형과 다각형 충돌체를 구현한다.

**Files:**
- Modify: `you/physics/collider.js`
- Modify: `tests/collider.test.js`

**Step 1: 테스트 추가**

```javascript
// tests/collider.test.js에 추가
import { CircleCollider, PolygonCollider } from '../you/physics/collider.js'

describe('CircleCollider', () => {
  describe('생성자', () => {
    it('radius 필수', () => {
      const collider = new CircleCollider({ radius: 16 })
      expect(collider.radius).toBe(16)
    })
  })

  describe('getBounds', () => {
    it('원의 바운딩 박스 반환', () => {
      const collider = new CircleCollider({ radius: 10, offset: [0, 0] })
      collider.object = { position: [100, 100] }

      const bounds = collider.getBounds()

      expect(bounds.x).toBe(100)
      expect(bounds.y).toBe(100)
      expect(bounds.radius).toBe(10)
    })
  })

  describe('getCircle', () => {
    it('월드 좌표 기준 원 정보 반환', () => {
      const collider = new CircleCollider({ radius: 10, offset: [5, 5] })
      collider.object = { position: [100, 100] }

      const circle = collider.getCircle()

      expect(circle.x).toBe(105)
      expect(circle.y).toBe(105)
      expect(circle.radius).toBe(10)
    })
  })
})

describe('PolygonCollider', () => {
  describe('생성자', () => {
    it('vertices 필수', () => {
      const vertices = [[0, 0], [10, 0], [10, 10], [0, 10]]
      const collider = new PolygonCollider({ vertices })
      expect(collider.vertices).toEqual(vertices)
    })
  })

  describe('getWorldVertices', () => {
    it('월드 좌표 기준 꼭짓점 반환', () => {
      const collider = new PolygonCollider({
        vertices: [[0, 0], [10, 0], [10, 10]],
        offset: [0, 0]
      })
      collider.object = { position: [100, 100] }

      const worldVerts = collider.getWorldVertices()

      expect(worldVerts[0]).toEqual([100, 100])
      expect(worldVerts[1]).toEqual([110, 100])
      expect(worldVerts[2]).toEqual([110, 110])
    })
  })

  describe('getBounds', () => {
    it('다각형의 AABB 반환', () => {
      const collider = new PolygonCollider({
        vertices: [[0, 0], [20, 0], [20, 30], [0, 30]],
        offset: [0, 0]
      })
      collider.object = { position: [100, 100] }

      const bounds = collider.getBounds()

      expect(bounds.x).toBe(100)
      expect(bounds.y).toBe(100)
      expect(bounds.width).toBe(20)
      expect(bounds.height).toBe(30)
    })
  })
})
```

**Step 2: 테스트 실패 확인**

Run: `pnpm test tests/collider.test.js`
Expected: FAIL (CircleCollider, PolygonCollider를 찾을 수 없음)

**Step 3: CircleCollider, PolygonCollider 구현**

```javascript
// you/physics/collider.js에 추가

/**
 * CircleCollider - 원형 충돌 영역
 */
export class CircleCollider extends Collider {
  constructor({
    radius,
    ...options
  } = {}) {
    super(options)

    if (typeof radius !== 'number' || radius <= 0) {
      throw new Error('CircleCollider requires positive radius')
    }

    this.radius = radius
  }

  getBounds() {
    const pos = this.object?.position ?? [0, 0]
    return {
      x: pos[0] + this.offset[0],
      y: pos[1] + this.offset[1],
      radius: this.radius
    }
  }

  getCircle() {
    const pos = this.object?.position ?? [0, 0]
    return {
      x: pos[0] + this.offset[0],
      y: pos[1] + this.offset[1],
      radius: this.radius
    }
  }
}

/**
 * PolygonCollider - 다각형 충돌 영역
 */
export class PolygonCollider extends Collider {
  constructor({
    vertices,
    ...options
  } = {}) {
    super(options)

    if (!vertices || vertices.length < 3) {
      throw new Error('PolygonCollider requires at least 3 vertices')
    }

    this.vertices = vertices.map(v => [...v])
  }

  getWorldVertices() {
    const pos = this.object?.position ?? [0, 0]
    return this.vertices.map(v => [
      v[0] + pos[0] + this.offset[0],
      v[1] + pos[1] + this.offset[1]
    ])
  }

  getBounds() {
    const worldVerts = this.getWorldVertices()

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    for (const v of worldVerts) {
      minX = Math.min(minX, v[0])
      minY = Math.min(minY, v[1])
      maxX = Math.max(maxX, v[0])
      maxY = Math.max(maxY, v[1])
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm test tests/collider.test.js`
Expected: PASS

**Step 5: 커밋**

```bash
git add you/physics/collider.js tests/collider.test.js
git commit -m "feat: CircleCollider, PolygonCollider 구현"
```

---

## Task 5: PhysicsWorld 기본 구조

물리 월드의 기본 구조 및 콜라이더 관리를 구현한다.

**Files:**
- Create: `you/physics/physics-world.js`
- Test: `tests/physics-world.test.js`

**Step 1: 테스트 파일 생성**

```javascript
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
```

**Step 2: 테스트 실패 확인**

Run: `pnpm test tests/physics-world.test.js`
Expected: FAIL (모듈을 찾을 수 없음)

**Step 3: PhysicsWorld 기본 구조 구현**

```javascript
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
```

**Step 4: 테스트 통과 확인**

Run: `pnpm test tests/physics-world.test.js`
Expected: PASS

**Step 5: 커밋**

```bash
git add you/physics/physics-world.js tests/physics-world.test.js
git commit -m "feat: PhysicsWorld 기본 구조 구현"
```

---

## Task 6: PhysicsWorld 충돌 이벤트 및 Raycast

충돌 이벤트 시스템과 레이캐스트를 구현한다.

**Files:**
- Modify: `you/physics/physics-world.js`
- Modify: `tests/physics-world.test.js`

**Step 1: 테스트 추가**

```javascript
// tests/physics-world.test.js에 추가

describe('충돌 이벤트', () => {
  it('collisionEnter 이벤트 발생', () => {
    const world = new PhysicsWorld({ gravity: [0, 0] })

    const colliderA = new BoxCollider({ size: [10, 10], type: 'dynamic' })
    const colliderB = new BoxCollider({ size: [10, 10], type: 'static' })

    createMockObject([0, 0], [colliderA])
    createMockObject([5, 0], [colliderB])

    const handler = vi.fn()
    colliderA.event.on('collisionEnter', handler)

    world.add(colliderA)
    world.add(colliderB)
    world.update(0.016)

    expect(handler).toHaveBeenCalled()
  })

  it('triggerEnter 이벤트 발생 (trigger 타입)', () => {
    const world = new PhysicsWorld({ gravity: [0, 0] })

    const colliderA = new BoxCollider({ size: [10, 10], type: 'dynamic' })
    const colliderB = new BoxCollider({ size: [10, 10], type: 'trigger' })

    createMockObject([0, 0], [colliderA])
    createMockObject([5, 0], [colliderB])

    const handler = vi.fn()
    colliderB.event.on('triggerEnter', handler)

    world.add(colliderA)
    world.add(colliderB)
    world.update(0.016)

    expect(handler).toHaveBeenCalled()
  })
})

describe('raycast', () => {
  it('광선과 박스 충돌 감지', () => {
    const world = new PhysicsWorld()

    const collider = new BoxCollider({ size: [10, 10], type: 'static' })
    createMockObject([50, 0], [collider])

    world.add(collider)

    const result = world.raycast([0, 5], [1, 0], 100)

    expect(result.hit).toBe(true)
    expect(result.collider).toBe(collider)
    expect(result.distance).toBeCloseTo(50, 1)
  })

  it('광선이 아무것도 맞지 않으면 hit: false', () => {
    const world = new PhysicsWorld()

    const collider = new BoxCollider({ size: [10, 10], type: 'static' })
    createMockObject([50, 50], [collider])

    world.add(collider)

    const result = world.raycast([0, 0], [1, 0], 100)

    expect(result.hit).toBe(false)
  })

  it('maxDistance 제한', () => {
    const world = new PhysicsWorld()

    const collider = new BoxCollider({ size: [10, 10], type: 'static' })
    createMockObject([50, 0], [collider])

    world.add(collider)

    const result = world.raycast([0, 5], [1, 0], 30)

    expect(result.hit).toBe(false)
  })

  it('원형 콜라이더와 충돌 감지', () => {
    const world = new PhysicsWorld()

    const collider = new CircleCollider({ radius: 10, type: 'static' })
    createMockObject([50, 5], [collider])

    world.add(collider)

    const result = world.raycast([0, 5], [1, 0], 100)

    expect(result.hit).toBe(true)
    expect(result.collider).toBe(collider)
  })
})
```

**Step 2: 테스트 실패 확인**

Run: `pnpm test tests/physics-world.test.js`
Expected: FAIL (raycast가 정의되지 않음)

**Step 3: Raycast 구현**

```javascript
// you/physics/physics-world.js에 raycast 메서드 추가

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
      return this._raycastBox(origin, direction, collider.getBounds(), maxDistance)
    } else if (collider instanceof CircleCollider) {
      return this._raycastCircle(origin, direction, collider.getCircle(), maxDistance, collider)
    }
    return null
  }

  /**
   * 박스에 대한 레이캐스트 (슬랩 알고리즘)
   */
  _raycastBox(origin, direction, box, maxDistance) {
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
      collider: this._colliders.find(c => {
        if (c instanceof BoxCollider) {
          const b = c.getBounds()
          return b.x === box.x && b.y === box.y
        }
        return false
      }),
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
```

**Step 4: 테스트 통과 확인**

Run: `pnpm test tests/physics-world.test.js`
Expected: PASS

**Step 5: 커밋**

```bash
git add you/physics/physics-world.js tests/physics-world.test.js
git commit -m "feat: PhysicsWorld raycast 구현"
```

---

## Task 7: 통합 테스트 및 최종 검증

전체 물리 시스템 통합 테스트를 작성한다.

**Files:**
- Create: `tests/physics-integration.test.js`

**Step 1: 통합 테스트 작성**

```javascript
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
```

**Step 2: 테스트 실행**

Run: `pnpm test tests/physics-integration.test.js`
Expected: PASS

**Step 3: 전체 물리 테스트 실행**

Run: `pnpm test tests/physics`
Expected: 모든 테스트 PASS

**Step 4: 커밋**

```bash
git add tests/physics-integration.test.js
git commit -m "test: 물리 시스템 통합 테스트 추가"
```

---

## Task 8: 모듈 내보내기 및 문서화

물리 시스템 모듈을 정리하고 인덱스 파일을 생성한다.

**Files:**
- Create: `you/physics/index.js`

**Step 1: 인덱스 파일 생성**

```javascript
// you/physics/index.js
export { Rigidbody } from './rigidbody.js'
export { Collider, BoxCollider, CircleCollider, PolygonCollider } from './collider.js'
export { PhysicsWorld } from './physics-world.js'
export {
  testAABB,
  testCircleCircle,
  testBoxCircle,
  getAABBContact,
  getCircleContact,
  getBoxCircleContact
} from './collision.js'
```

**Step 2: 테스트로 내보내기 확인**

```javascript
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
```

**Step 3: 테스트 실행**

Run: `pnpm test tests/physics-exports.test.js`
Expected: PASS

**Step 4: 전체 테스트 실행**

Run: `pnpm test`
Expected: 모든 테스트 PASS

**Step 5: 커밋**

```bash
git add you/physics/index.js tests/physics-exports.test.js
git commit -m "feat: 물리 시스템 모듈 내보내기 정리"
```

---

## 최종 파일 구조

```
you/physics/
├── index.js           # 모듈 내보내기
├── collision.js       # 충돌 감지 유틸리티
├── rigidbody.js       # Rigidbody 컴포넌트
├── collider.js        # Collider (Box, Circle, Polygon)
└── physics-world.js   # PhysicsWorld (전체 관리)

tests/
├── physics-collision.test.js
├── rigidbody.test.js
├── collider.test.js
├── physics-world.test.js
├── physics-integration.test.js
└── physics-exports.test.js
```

---

**Plan complete and saved to `docs/plans/2026-01-11-physics-system.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
