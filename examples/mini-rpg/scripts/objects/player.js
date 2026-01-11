import { Object } from '../../../../you/object.js'
import { PlayerController } from '../components/player-controller.js'
import { ShapeRenderer } from '../components/shape-renderer.js'
import { Stats } from '../components/stats.js'
import { AttackController } from '../components/attack-controller.js'
import { HpBar } from '../components/hp-bar.js'

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
      }),
      new Stats({ maxHp: 100, attack: 15, defense: 5 }),
      new AttackController({ range: 50, cooldown: 0.4 }),
      new HpBar({ width: 40, height: 6, offsetY: -25 })
    ]
  })

  player.position = [x, y]

  return player
}
