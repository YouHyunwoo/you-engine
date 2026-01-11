import { Component } from '../../../../you/component.js'

export class Collider extends Component {
  constructor({
    shape = 'circle',
    radius = 16,
    width = 32,
    height = 32,
    offset = [0, 0],
    isStatic = true
  } = {}) {
    super()
    this.shape = shape
    this.radius = radius
    this.width = width
    this.height = height
    this.offset = offset
    this.isStatic = isStatic
  }

  // 충돌체의 월드 좌표 중심
  getCenter() {
    const pos = this.object.position
    return [pos[0] + this.offset[0], pos[1] + this.offset[1]]
  }

  // 다른 Collider와 충돌 검사
  collidesWith(other) {
    if (this.shape === 'circle' && other.shape === 'circle') {
      return this.circleToCircle(other)
    } else if (this.shape === 'rect' && other.shape === 'rect') {
      return this.rectToRect(other)
    } else {
      return this.circleToRect(other)
    }
  }

  // 특정 원형 영역과 충돌 검사 (위치 기반)
  collidesWithCircle(x, y, radius) {
    const [cx, cy] = this.getCenter()

    if (this.shape === 'circle') {
      const dx = cx - x
      const dy = cy - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      return dist < this.radius + radius
    } else {
      // 사각형-원 충돌
      const halfW = this.width / 2
      const halfH = this.height / 2
      const closestX = Math.max(cx - halfW, Math.min(x, cx + halfW))
      const closestY = Math.max(cy - halfH, Math.min(y, cy + halfH))
      const dx = x - closestX
      const dy = y - closestY
      return (dx * dx + dy * dy) < radius * radius
    }
  }

  circleToCircle(other) {
    const [ax, ay] = this.getCenter()
    const [bx, by] = other.getCenter()
    const dx = ax - bx
    const dy = ay - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    return dist < this.radius + other.radius
  }

  rectToRect(other) {
    const [ax, ay] = this.getCenter()
    const [bx, by] = other.getCenter()
    const aHalfW = this.width / 2
    const aHalfH = this.height / 2
    const bHalfW = other.width / 2
    const bHalfH = other.height / 2

    return (
      Math.abs(ax - bx) < aHalfW + bHalfW &&
      Math.abs(ay - by) < aHalfH + bHalfH
    )
  }

  circleToRect(other) {
    // this가 circle이면 other가 rect, 반대도 처리
    const circle = this.shape === 'circle' ? this : other
    const rect = this.shape === 'rect' ? this : other

    const [cx, cy] = circle.getCenter()
    const [rx, ry] = rect.getCenter()
    const halfW = rect.width / 2
    const halfH = rect.height / 2

    const closestX = Math.max(rx - halfW, Math.min(cx, rx + halfW))
    const closestY = Math.max(ry - halfH, Math.min(cy, ry + halfH))

    const dx = cx - closestX
    const dy = cy - closestY
    return (dx * dx + dy * dy) < circle.radius * circle.radius
  }
}
