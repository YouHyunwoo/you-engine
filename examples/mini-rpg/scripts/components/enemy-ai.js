import { Component } from '../../../../you/component.js'

export class EnemyAI extends Component {
  constructor({
    speed = 50,
    detectionRange = 150,
    attackRange = 30
  } = {}) {
    super()
    this.speed = speed
    this.detectionRange = detectionRange
    this.attackRange = attackRange
    this.target = null
    this.state = 'idle' // idle, chase, attack
  }

  setTarget(target) {
    this.target = target
  }

  didUpdate(deltaTime) {
    if (!this.target) return

    const pos = this.object.position
    const targetPos = this.target.position

    const dx = targetPos[0] - pos[0]
    const dy = targetPos[1] - pos[1]
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < this.attackRange) {
      this.state = 'attack'
    } else if (distance < this.detectionRange) {
      this.state = 'chase'
      // 플레이어 방향으로 이동
      const dirX = dx / distance
      const dirY = dy / distance
      pos[0] += dirX * this.speed * deltaTime
      pos[1] += dirY * this.speed * deltaTime
    } else {
      this.state = 'idle'
    }
  }
}
