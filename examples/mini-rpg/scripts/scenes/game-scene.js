import { Scene } from '../../../../you/scene.js'
import { createPlayer } from '../objects/player.js'

export class GameScene extends Scene {
  willCreate() {
    this.mapSize = [1600, 1200]
  }

  didCreate() {
    const player = createPlayer(400, 300)
    this.add(player)

    // 카메라가 플레이어를 따라가도록
    this.player = player
  }

  didUpdate(deltaTime, events, input) {
    // 카메라 플레이어 추적
    if (this.camera && this.player) {
      this.camera.position[0] = this.player.position[0]
      this.camera.position[1] = this.player.position[1]
    }
  }

  didRender(context) {
    context.fillStyle = '#3d5a3d'
    context.fillRect(0, 0, this.mapSize[0], this.mapSize[1])
  }
}
