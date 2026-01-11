import { Component } from '../../../../you/component.js'

export class PlayerController extends Component {
  constructor({ speed = 150 } = {}) {
    super()
    this.speed = speed
    this.direction = [0, 0]
  }

  didUpdate(deltaTime, events, input) {
    const dir = [0, 0]

    if (input.keys.has('w') || input.keys.has('ArrowUp')) dir[1] = -1
    if (input.keys.has('s') || input.keys.has('ArrowDown')) dir[1] = 1
    if (input.keys.has('a') || input.keys.has('ArrowLeft')) dir[0] = -1
    if (input.keys.has('d') || input.keys.has('ArrowRight')) dir[0] = 1

    // 대각선 이동 정규화
    const length = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1])
    if (length > 0) {
      dir[0] /= length
      dir[1] /= length
    }

    this.direction = dir

    const pos = this.object.position
    pos[0] += dir[0] * this.speed * deltaTime
    pos[1] += dir[1] * this.speed * deltaTime
  }
}
