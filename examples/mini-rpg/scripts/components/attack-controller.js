import { Component } from '../../../../you/component.js'
import { Stats } from './stats.js'

export class AttackController extends Component {
  constructor({
    range = 50,
    cooldown = 0.5
  } = {}) {
    super()
    this.range = range
    this.cooldown = cooldown
    this._cooldownTimer = 0
    this._attacking = false
    this._attackDuration = 0.15
    this._attackTimer = 0
  }

  get canAttack() { return this._cooldownTimer <= 0 }
  get attacking() { return this._attacking }

  attack(targets) {
    if (!this.canAttack) return []

    this._cooldownTimer = this.cooldown
    this._attacking = true
    this._attackTimer = this._attackDuration

    const stats = this.object.findComponent(Stats)
    const pos = this.object.position
    const hits = []

    for (const target of targets) {
      const targetPos = target.position
      const dx = targetPos[0] - pos[0]
      const dy = targetPos[1] - pos[1]
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= this.range) {
        const targetStats = target.findComponent(Stats)
        if (targetStats && targetStats.alive) {
          const damage = targetStats.takeDamage(stats.attack)
          hits.push({ target, damage })
        }
      }
    }

    return hits
  }

  didUpdate(deltaTime) {
    if (this._cooldownTimer > 0) {
      this._cooldownTimer -= deltaTime
    }

    if (this._attacking) {
      this._attackTimer -= deltaTime
      if (this._attackTimer <= 0) {
        this._attacking = false
      }
    }
  }
}
