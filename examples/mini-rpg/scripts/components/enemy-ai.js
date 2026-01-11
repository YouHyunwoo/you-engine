import { Component } from '../../../../you/component.js'
import { Stats } from './stats.js'

export class EnemyAI extends Component {
  constructor({
    speed = 50,
    detectionRange = 150,
    attackRange = 30,
    attackCooldown = 1.0
  } = {}) {
    super()
    this.speed = speed
    this.detectionRange = detectionRange
    this.attackRange = attackRange
    this.attackCooldown = attackCooldown
    this._cooldownTimer = 0
    this.target = null
    this.state = 'idle'
  }

  setTarget(target) {
    this.target = target
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
      pos[0] += dirX * this.speed * deltaTime
      pos[1] += dirY * this.speed * deltaTime
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
