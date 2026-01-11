export class Particle {
  constructor({
    position = [0, 0],
    velocity = [0, 0],
    lifetime = 1,
    gravity = [0, 0],
    friction = 0,
    size = 8,
    alpha = 1,
    color = '#ffffff',
    rotation = 0,
    rotationSpeed = 0,
  } = {}) {
    this.position = [...position]
    this.velocity = [...velocity]
    this.lifetime = lifetime
    this.gravity = [...gravity]
    this.friction = friction

    this.size = size
    this.alpha = alpha
    this.color = color
    this.rotation = rotation
    this.rotationSpeed = rotationSpeed

    this.age = 0
    this.alive = true
  }

  get progress() {
    return Math.min(this.age / this.lifetime, 1)
  }

  update(deltaTime) {
    if (!this.alive) return

    // 중력 적용
    this.velocity[0] += this.gravity[0] * deltaTime
    this.velocity[1] += this.gravity[1] * deltaTime

    // 마찰 적용
    if (this.friction > 0) {
      const factor = 1 - this.friction * deltaTime
      this.velocity[0] *= factor
      this.velocity[1] *= factor
    }

    // 위치 업데이트
    this.position[0] += this.velocity[0] * deltaTime
    this.position[1] += this.velocity[1] * deltaTime

    // 회전 업데이트
    this.rotation += this.rotationSpeed * deltaTime

    // 나이 업데이트
    this.age += deltaTime

    // 수명 체크
    if (this.age >= this.lifetime) {
      this.alive = false
    }
  }

  reset(options = {}) {
    this.position = [...(options.position ?? [0, 0])]
    this.velocity = [...(options.velocity ?? [0, 0])]
    this.lifetime = options.lifetime ?? 1
    this.gravity = [...(options.gravity ?? [0, 0])]
    this.friction = options.friction ?? 0

    this.size = options.size ?? 8
    this.alpha = options.alpha ?? 1
    this.color = options.color ?? '#ffffff'
    this.rotation = options.rotation ?? 0
    this.rotationSpeed = options.rotationSpeed ?? 0

    this.age = 0
    this.alive = true
  }
}
