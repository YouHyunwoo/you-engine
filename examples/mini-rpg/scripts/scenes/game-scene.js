import { Scene } from '../../../../you/scene.js'
import { createPlayer } from '../objects/player.js'
import { createMushroom, createAnt } from '../objects/enemy.js'
import { PlayerController } from '../components/player-controller.js'
import { EnemyAI } from '../components/enemy-ai.js'

export class GameScene extends Scene {
  willCreate() {
    this.mapSize = [1600, 1200]
  }

  didCreate() {
    const player = createPlayer(400, 300)
    this.add(player)

    // 플레이어 경계 설정
    const controller = player.findComponent(PlayerController)
    controller.setBounds(0, 0, this.mapSize[0], this.mapSize[1])

    // 카메라가 플레이어를 따라가도록
    this.player = player

    this.spawnEnemies()
  }

  spawnEnemies() {
    const enemies = [
      createMushroom(600, 400),
      createMushroom(700, 500),
      createAnt(500, 200),
      createAnt(800, 300),
      createAnt(550, 350)
    ]

    for (const enemy of enemies) {
      const ai = enemy.findComponent(EnemyAI)
      ai.setTarget(this.player)
      this.add(enemy)
    }
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
