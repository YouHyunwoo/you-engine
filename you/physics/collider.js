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
