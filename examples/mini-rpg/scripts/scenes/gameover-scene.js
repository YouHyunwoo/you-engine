import { Scene } from '../../../../you/scene.js'
import { GameScene } from './game-scene.js'

export class GameOverScene extends Scene {
  didRender(context, screen) {
    // 배경
    context.fillStyle = 'rgba(0, 0, 0, 0.8)'
    context.fillRect(0, 0, screen.width, screen.height)

    // 텍스트
    context.fillStyle = '#dd4444'
    context.font = 'bold 48px Arial'
    context.textAlign = 'center'
    context.fillText('GAME OVER', screen.width / 2, screen.height / 2 - 30)

    context.fillStyle = '#ffffff'
    context.font = '24px Arial'
    context.fillText('Press SPACE to restart', screen.width / 2, screen.height / 2 + 30)

    context.textAlign = 'left'
  }

  didUpdate(deltaTime, events) {
    for (const ev of events) {
      if (ev.type === 'keydown' && ev.key === ' ') {
        this.transit(new GameScene())
      }
    }
  }
}
