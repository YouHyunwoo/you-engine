import { Scene } from '../../../../you/scene.js'

export class GameScene extends Scene {
  willCreate() {
    this.mapSize = [1600, 1200]
  }

  didCreate() {
    console.log('GameScene created')
  }

  didUpdate(deltaTime, events, input) {
    // 게임 로직
  }

  didRender(context) {
    // 배경 렌더링
    context.fillStyle = '#3d5a3d'
    context.fillRect(0, 0, this.mapSize[0], this.mapSize[1])
  }
}
