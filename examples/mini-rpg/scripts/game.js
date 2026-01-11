import { SceneApplication } from '../../../you/application.js'
import { GameScene } from './scenes/game-scene.js'

export class MiniRPG extends SceneApplication {
  didCreate() {
    this.push(new GameScene())
  }
}
