import { Component } from '../../../../you/component.js'
import { Stats } from './stats.js'
import { Collider } from './collider.js'

export class EnemyAI extends Component {
  constructor({
    speed = 50,
    detectionRange = 150,
    attackRange = 30,
    attackCooldown = 1.0,
    radius = 12
  } = {}) {
    super()
    this.speed = speed
    this.detectionRange = detectionRange
    this.attackRange = attackRange
    this.attackCooldown = attackCooldown
    this.radius = radius
    this._cooldownTimer = 0
    this.target = null
    this.state = 'idle'
  }

  setTarget(target) {
    this.target = target
  }

  // 충돌 검사: 타일맵 + 구조물 충돌 체크
  checkCollision(newX, newY, radius) {
    const scene = this.object.parent

    // 타일맵 충돌 체크
    if (scene.tilemap) {
      if (!scene.tilemap.isPassableCircle(newX, newY, radius)) {
        return true
      }
    }

    // 구조물 충돌 체크
    const structures = scene.objects.filter(obj => obj.tags.has('structure'))
    for (const structure of structures) {
      const collider = structure.findComponent(Collider)
      if (collider && collider.collidesWithCircle(newX, newY, radius)) {
        return true
      }
    }

    return false
  }

  didUpdate(deltaTime) {
    if (!this.target) return

    // 쿨다운 감소
    if (this._cooldownTimer > 0) {
      this._cooldownTimer -= deltaTime
    }

    const pos = this.object.position
    const targetPos = this.target.position

    const dx = targetPos[0] - pos[0]
    const dy = targetPos[1] - pos[1]
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < this.attackRange) {
      this.state = 'attack'
      this.tryAttack()
    } else if (distance < this.detectionRange) {
      this.state = 'chase'
      const dirX = dx / distance
      const dirY = dy / distance

      // X축 이동 시도
      const newX = pos[0] + dirX * this.speed * deltaTime
      if (!this.checkCollision(newX, pos[1], this.radius)) {
        pos[0] = newX
      }

      // Y축 이동 시도
      const newY = pos[1] + dirY * this.speed * deltaTime
      if (!this.checkCollision(pos[0], newY, this.radius)) {
        pos[1] = newY
      }
    } else {
      this.state = 'idle'
    }
  }

  tryAttack() {
    if (this._cooldownTimer > 0) return

    this._cooldownTimer = this.attackCooldown

    const stats = this.object.findComponent(Stats)
    const targetStats = this.target.findComponent(Stats)

    if (stats && targetStats && targetStats.alive) {
      const damage = targetStats.takeDamage(stats.attack)
      console.log(`${this.object.name} attacks player for ${damage} damage`)
    }
  }
}
