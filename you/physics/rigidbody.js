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
