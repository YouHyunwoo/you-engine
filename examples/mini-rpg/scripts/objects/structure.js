import { Object } from '../../../../you/object.js'
import { Collider } from '../components/collider.js'
import { StructureRenderer } from '../components/structure-renderer.js'

// 나무 생성 (원형 충돌, 반지름 12)
export function createTree(x, y) {
  const tree = new Object({
    name: 'tree',
    tags: ['structure', 'tree'],
    components: [
      new Collider({ shape: 'circle', radius: 12, offset: [0, 10] }),
      new StructureRenderer({ type: 'tree' })
    ]
  })
  tree.position = [x, y]
  return tree
}

// 바위 생성 (원형 충돌, 반지름 14)
export function createRock(x, y) {
  const rock = new Object({
    name: 'rock',
    tags: ['structure', 'rock'],
    components: [
      new Collider({ shape: 'circle', radius: 14 }),
      new StructureRenderer({ type: 'rock' })
    ]
  })
  rock.position = [x, y]
  return rock
}
