import { Object } from '../../../../you/object.js'
import { PlayerController } from '../components/player-controller.js'
import { ShapeRenderer } from '../components/shape-renderer.js'

export function createPlayer(x, y) {
  const player = new Object({
    name: 'player',
    components: [
      new PlayerController({ speed: 150 }),
      new ShapeRenderer({
        shape: 'circle',
        size: 32,
        color: '#4a90d9',
        strokeColor: '#2a5a99',
        strokeWidth: 3
      })
    ]
  })

  player.position = [x, y]

  return player
}
