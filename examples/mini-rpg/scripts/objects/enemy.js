import { Object } from '../../../../you/object.js'
import { EnemyAI } from '../components/enemy-ai.js'
import { ShapeRenderer } from '../components/shape-renderer.js'

export function createMushroom(x, y) {
  const enemy = new Object({
    name: 'mushroom',
    tags: ['enemy'],
    components: [
      new EnemyAI({ speed: 40, detectionRange: 120, attackRange: 25 }),
      new ShapeRenderer({
        shape: 'circle',
        size: 28,
        color: '#d94a4a',
        strokeColor: '#992a2a',
        strokeWidth: 2
      })
    ]
  })

  enemy.position = [x, y]

  return enemy
}

export function createAnt(x, y) {
  const enemy = new Object({
    name: 'ant',
    tags: ['enemy'],
    components: [
      new EnemyAI({ speed: 80, detectionRange: 100, attackRange: 20 }),
      new ShapeRenderer({
        shape: 'circle',
        size: 20,
        color: '#2a2a2a',
        strokeColor: '#1a1a1a',
        strokeWidth: 2
      })
    ]
  })

  enemy.position = [x, y]

  return enemy
}
