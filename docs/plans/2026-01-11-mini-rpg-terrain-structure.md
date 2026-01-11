# Mini-RPG 지형 및 구조물 시스템 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 타일맵 기반 지형과 구조물 오브젝트를 추가하여 플레이어/적의 이동을 제한한다.

**Architecture:** TileMap 컴포넌트로 지형 렌더링 및 충돌 판정, Collider 컴포넌트로 구조물 충돌 처리. PlayerController와 EnemyAI에서 이동 전 충돌 체크 후 이동 여부 결정.

**Tech Stack:** JavaScript ES6 모듈, you-engine Component 시스템

---

## Task 1: 맵 데이터 정의

**Files:**
- Create: `examples/mini-rpg/scripts/data/maps.js`

**Step 1: 맵 데이터 파일 생성**

```javascript
// 타일 ID 상수
export const TILE = {
  GRASS: 0,
  DIRT: 1,
  WATER: 2,
  WALL: 3
}

// 통과 불가 타일 목록
export const IMPASSABLE_TILES = [TILE.WATER, TILE.WALL]

// 타일 색상
export const TILE_COLORS = {
  [TILE.GRASS]: '#4a7c3f',
  [TILE.DIRT]: '#8b6b4a',
  [TILE.WATER]: '#3a6ea5',
  [TILE.WALL]: '#6b6b6b'
}

// 맵 크기: 100x75 타일 (1600x1200 픽셀)
export const FOREST_MAP = generateForestMap(100, 75)

function generateForestMap(width, height) {
  const tiles = []
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      // 기본은 잔디
      let tile = TILE.GRASS

      // 가장자리는 물
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        tile = TILE.WATER
      }
      // 랜덤 흙 패치 (10% 확률)
      else if (Math.random() < 0.1) {
        tile = TILE.DIRT
      }
      // 랜덤 물웅덩이 (2% 확률, 가장자리 제외)
      else if (Math.random() < 0.02 && x > 5 && x < width - 5 && y > 5 && y < height - 5) {
        tile = TILE.WATER
      }

      row.push(tile)
    }
    tiles.push(row)
  }
  return tiles
}
```

**Step 2: 커밋**

```bash
git add examples/mini-rpg/scripts/data/maps.js
git commit -m "feat(mini-rpg): 맵 데이터 모듈 추가"
```

---

## Task 2: TileMap 컴포넌트 구현

**Files:**
- Create: `examples/mini-rpg/scripts/components/tilemap.js`

**Step 1: TileMap 컴포넌트 작성**

```javascript
import { Component } from '../../../../you/component.js'
import { TILE_COLORS, IMPASSABLE_TILES } from '../data/maps.js'

export class TileMap extends Component {
  constructor({ tiles, tileSize = 16 } = {}) {
    super()
    this.tiles = tiles
    this.tileSize = tileSize
    this.width = tiles[0]?.length || 0
    this.height = tiles.length
  }

  // 월드 좌표 → 타일 좌표
  worldToTile(x, y) {
    return [
      Math.floor(x / this.tileSize),
      Math.floor(y / this.tileSize)
    ]
  }

  // 타일 좌표 → 월드 좌표 (타일 중심)
  tileToWorld(tx, ty) {
    return [
      tx * this.tileSize + this.tileSize / 2,
      ty * this.tileSize + this.tileSize / 2
    ]
  }

  // 특정 위치의 타일 ID 반환
  getTileAt(x, y) {
    const [tx, ty] = this.worldToTile(x, y)
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return -1 // 맵 밖
    }
    return this.tiles[ty][tx]
  }

  // 특정 위치가 통과 가능한지 확인
  isPassable(x, y) {
    const tile = this.getTileAt(x, y)
    if (tile === -1) return false
    return !IMPASSABLE_TILES.includes(tile)
  }

  // 원형 영역이 통과 가능한지 확인 (4방향 체크)
  isPassableCircle(x, y, radius) {
    return (
      this.isPassable(x - radius, y) &&
      this.isPassable(x + radius, y) &&
      this.isPassable(x, y - radius) &&
      this.isPassable(x, y + radius)
    )
  }

  didRender(context) {
    // 카메라 뷰포트 내의 타일만 렌더링 (최적화)
    const camera = this.object?.parent?.camera
    if (!camera) return

    const screenWidth = camera.screen.width
    const screenHeight = camera.screen.height
    const camX = camera.position[0]
    const camY = camera.position[1]

    const startX = Math.max(0, Math.floor((camX - screenWidth / 2) / this.tileSize))
    const endX = Math.min(this.width, Math.ceil((camX + screenWidth / 2) / this.tileSize))
    const startY = Math.max(0, Math.floor((camY - screenHeight / 2) / this.tileSize))
    const endY = Math.min(this.height, Math.ceil((camY + screenHeight / 2) / this.tileSize))

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = this.tiles[ty][tx]
        context.fillStyle = TILE_COLORS[tile] || '#ff00ff'
        context.fillRect(
          tx * this.tileSize,
          ty * this.tileSize,
          this.tileSize,
          this.tileSize
        )
      }
    }
  }
}
```

**Step 2: 커밋**

```bash
git add examples/mini-rpg/scripts/components/tilemap.js
git commit -m "feat(mini-rpg): TileMap 컴포넌트 구현"
```

---

## Task 3: Collider 컴포넌트 구현

**Files:**
- Create: `examples/mini-rpg/scripts/components/collider.js`

**Step 1: Collider 컴포넌트 작성**

```javascript
import { Component } from '../../../../you/component.js'

export class Collider extends Component {
  constructor({
    shape = 'circle',
    radius = 16,
    width = 32,
    height = 32,
    offset = [0, 0],
    isStatic = true
  } = {}) {
    super()
    this.shape = shape
    this.radius = radius
    this.width = width
    this.height = height
    this.offset = offset
    this.isStatic = isStatic
  }

  // 충돌체의 월드 좌표 중심
  getCenter() {
    const pos = this.object.position
    return [pos[0] + this.offset[0], pos[1] + this.offset[1]]
  }

  // 다른 Collider와 충돌 검사
  collidesWith(other) {
    if (this.shape === 'circle' && other.shape === 'circle') {
      return this.circleToCircle(other)
    } else if (this.shape === 'rect' && other.shape === 'rect') {
      return this.rectToRect(other)
    } else {
      return this.circleToRect(other)
    }
  }

  // 특정 원형 영역과 충돌 검사 (위치 기반)
  collidesWithCircle(x, y, radius) {
    const [cx, cy] = this.getCenter()

    if (this.shape === 'circle') {
      const dx = cx - x
      const dy = cy - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      return dist < this.radius + radius
    } else {
      // 사각형-원 충돌
      const halfW = this.width / 2
      const halfH = this.height / 2
      const closestX = Math.max(cx - halfW, Math.min(x, cx + halfW))
      const closestY = Math.max(cy - halfH, Math.min(y, cy + halfH))
      const dx = x - closestX
      const dy = y - closestY
      return (dx * dx + dy * dy) < radius * radius
    }
  }

  circleToCircle(other) {
    const [ax, ay] = this.getCenter()
    const [bx, by] = other.getCenter()
    const dx = ax - bx
    const dy = ay - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    return dist < this.radius + other.radius
  }

  rectToRect(other) {
    const [ax, ay] = this.getCenter()
    const [bx, by] = other.getCenter()
    const aHalfW = this.width / 2
    const aHalfH = this.height / 2
    const bHalfW = other.width / 2
    const bHalfH = other.height / 2

    return (
      Math.abs(ax - bx) < aHalfW + bHalfW &&
      Math.abs(ay - by) < aHalfH + bHalfH
    )
  }

  circleToRect(other) {
    // this가 circle이면 other가 rect, 반대도 처리
    const circle = this.shape === 'circle' ? this : other
    const rect = this.shape === 'rect' ? this : other

    const [cx, cy] = circle.getCenter()
    const [rx, ry] = rect.getCenter()
    const halfW = rect.width / 2
    const halfH = rect.height / 2

    const closestX = Math.max(rx - halfW, Math.min(cx, rx + halfW))
    const closestY = Math.max(ry - halfH, Math.min(cy, ry + halfH))

    const dx = cx - closestX
    const dy = cy - closestY
    return (dx * dx + dy * dy) < circle.radius * circle.radius
  }
}
```

**Step 2: 커밋**

```bash
git add examples/mini-rpg/scripts/components/collider.js
git commit -m "feat(mini-rpg): Collider 컴포넌트 구현"
```

---

## Task 4: 구조물 팩토리 함수 구현

**Files:**
- Create: `examples/mini-rpg/scripts/objects/structure.js`

**Step 1: 구조물 팩토리 작성**

```javascript
import { Object } from '../../../../you/object.js'
import { Collider } from '../components/collider.js'

// 나무 생성 (원형 충돌, 반지름 20)
export function createTree(x, y) {
  const tree = new Object({
    name: 'tree',
    tags: ['structure', 'tree'],
    components: [
      new Collider({ shape: 'circle', radius: 12, offset: [0, 10] })
    ]
  })
  tree.position = [x, y]
  tree.renderTree = true
  return tree
}

// 바위 생성 (원형 충돌, 반지름 16)
export function createRock(x, y) {
  const rock = new Object({
    name: 'rock',
    tags: ['structure', 'rock'],
    components: [
      new Collider({ shape: 'circle', radius: 14 })
    ]
  })
  rock.position = [x, y]
  rock.renderRock = true
  return rock
}
```

**Step 2: 커밋**

```bash
git add examples/mini-rpg/scripts/objects/structure.js
git commit -m "feat(mini-rpg): 구조물 팩토리 함수 추가 (나무, 바위)"
```

---

## Task 5: 구조물 렌더러 컴포넌트 추가

**Files:**
- Create: `examples/mini-rpg/scripts/components/structure-renderer.js`

**Step 1: StructureRenderer 작성**

```javascript
import { Component } from '../../../../you/component.js'

export class StructureRenderer extends Component {
  constructor({ type = 'tree' } = {}) {
    super()
    this.type = type
  }

  didRender(context) {
    const pos = this.object.position

    if (this.type === 'tree') {
      this.renderTree(context, pos[0], pos[1])
    } else if (this.type === 'rock') {
      this.renderRock(context, pos[0], pos[1])
    }
  }

  renderTree(context, x, y) {
    // 줄기 (갈색 사각형)
    context.fillStyle = '#5d4037'
    context.fillRect(x - 4, y, 8, 20)

    // 잎 (녹색 원)
    context.fillStyle = '#2e7d32'
    context.beginPath()
    context.arc(x, y - 8, 18, 0, Math.PI * 2)
    context.fill()

    // 잎 하이라이트
    context.fillStyle = '#4caf50'
    context.beginPath()
    context.arc(x - 5, y - 12, 8, 0, Math.PI * 2)
    context.fill()
  }

  renderRock(context, x, y) {
    // 메인 바위 (회색 타원)
    context.fillStyle = '#757575'
    context.beginPath()
    context.ellipse(x, y, 16, 12, 0, 0, Math.PI * 2)
    context.fill()

    // 하이라이트
    context.fillStyle = '#9e9e9e'
    context.beginPath()
    context.ellipse(x - 4, y - 3, 6, 4, -0.3, 0, Math.PI * 2)
    context.fill()

    // 그림자
    context.fillStyle = '#616161'
    context.beginPath()
    context.ellipse(x + 4, y + 4, 5, 3, 0.3, 0, Math.PI * 2)
    context.fill()
  }
}
```

**Step 2: structure.js에 렌더러 추가**

`examples/mini-rpg/scripts/objects/structure.js` 수정:

```javascript
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
```

**Step 3: 커밋**

```bash
git add examples/mini-rpg/scripts/components/structure-renderer.js examples/mini-rpg/scripts/objects/structure.js
git commit -m "feat(mini-rpg): StructureRenderer 컴포넌트 추가"
```

---

## Task 6: GameScene에 TileMap 통합

**Files:**
- Modify: `examples/mini-rpg/scripts/scenes/game-scene.js`

**Step 1: TileMap import 및 생성**

파일 상단에 import 추가:
```javascript
import { TileMap } from '../components/tilemap.js'
import { FOREST_MAP } from '../data/maps.js'
import { Object } from '../../../../you/object.js'
```

**Step 2: willCreate()에서 맵 오브젝트 생성**

`didCreate()` 시작 부분에 추가:
```javascript
didCreate() {
  // 타일맵 오브젝트 생성
  const mapObject = new Object({ name: 'tilemap' })
  this.tilemap = new TileMap({ tiles: FOREST_MAP, tileSize: 16 })
  mapObject.addComponent(this.tilemap)
  mapObject.position = [0, 0]
  this.add(mapObject)

  // ... 기존 코드 유지
}
```

**Step 3: willRender() 제거 (TileMap이 배경 담당)**

`willRender()` 메서드 삭제 (TileMap.didRender()가 대체)

**Step 4: 커밋**

```bash
git add examples/mini-rpg/scripts/scenes/game-scene.js
git commit -m "feat(mini-rpg): GameScene에 TileMap 통합"
```

---

## Task 7: 구조물 랜덤 배치 구현

**Files:**
- Modify: `examples/mini-rpg/scripts/scenes/game-scene.js`

**Step 1: 구조물 import 추가**

```javascript
import { createTree, createRock } from '../objects/structure.js'
import { Collider } from '../components/collider.js'
```

**Step 2: spawnStructures() 메서드 추가**

```javascript
spawnStructures(count = 30) {
  const structures = []
  const playerSpawnRadius = 100
  const playerPos = [400, 300] // 플레이어 초기 위치

  let attempts = 0
  const maxAttempts = count * 10

  while (structures.length < count && attempts < maxAttempts) {
    attempts++

    // 랜덤 위치 (맵 가장자리 타일 피하기)
    const margin = 32
    const x = margin + Math.random() * (this.mapSize[0] - margin * 2)
    const y = margin + Math.random() * (this.mapSize[1] - margin * 2)

    // 플레이어 스폰 근처 제외
    const dx = x - playerPos[0]
    const dy = y - playerPos[1]
    if (Math.sqrt(dx * dx + dy * dy) < playerSpawnRadius) continue

    // 타일맵에서 통과 가능한지 확인
    if (!this.tilemap.isPassable(x, y)) continue

    // 기존 구조물과 겹침 검사
    let overlaps = false
    for (const s of structures) {
      const sdx = s.position[0] - x
      const sdy = s.position[1] - y
      if (Math.sqrt(sdx * sdx + sdy * sdy) < 40) {
        overlaps = true
        break
      }
    }
    if (overlaps) continue

    // 나무:바위 = 7:3 비율
    const structure = Math.random() < 0.7 ? createTree(x, y) : createRock(x, y)
    structures.push(structure)
    this.add(structure)
  }
}
```

**Step 3: didCreate()에서 호출**

`spawnEnemies()` 호출 전에 추가:
```javascript
this.spawnStructures(30)
```

**Step 4: 커밋**

```bash
git add examples/mini-rpg/scripts/scenes/game-scene.js
git commit -m "feat(mini-rpg): 구조물 랜덤 배치 구현"
```

---

## Task 8: PlayerController에 충돌 처리 추가

**Files:**
- Modify: `examples/mini-rpg/scripts/components/player-controller.js`

**Step 1: 충돌 체크 메서드 추가**

```javascript
import { Collider } from './collider.js'

// 클래스 내부에 추가
checkCollision(newX, newY, radius) {
  const scene = this.object.parent
  if (!scene) return false

  // 타일맵 충돌 체크
  const tilemap = scene.tilemap
  if (tilemap && !tilemap.isPassableCircle(newX, newY, radius)) {
    return true
  }

  // 구조물 충돌 체크
  const structures = scene.objects.filter(obj => obj.tags?.has('structure'))
  for (const structure of structures) {
    const collider = structure.findComponent(Collider)
    if (collider && collider.collidesWithCircle(newX, newY, radius)) {
      return true
    }
  }

  return false
}
```

**Step 2: didUpdate() 수정**

```javascript
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
  const radius = 16

  // X축 이동 시도
  const newX = pos[0] + dir[0] * this.speed * deltaTime
  if (!this.checkCollision(newX, pos[1], radius)) {
    pos[0] = newX
  }

  // Y축 이동 시도
  const newY = pos[1] + dir[1] * this.speed * deltaTime
  if (!this.checkCollision(pos[0], newY, radius)) {
    pos[1] = newY
  }

  // 경계 제한
  if (this.bounds) {
    const halfSize = radius
    pos[0] = Math.max(this.bounds.minX + halfSize, Math.min(this.bounds.maxX - halfSize, pos[0]))
    pos[1] = Math.max(this.bounds.minY + halfSize, Math.min(this.bounds.maxY - halfSize, pos[1]))
  }
}
```

**Step 3: 커밋**

```bash
git add examples/mini-rpg/scripts/components/player-controller.js
git commit -m "feat(mini-rpg): PlayerController 충돌 처리 추가"
```

---

## Task 9: EnemyAI에 충돌 처리 추가

**Files:**
- Modify: `examples/mini-rpg/scripts/components/enemy-ai.js`

**Step 1: 충돌 체크 메서드 추가**

```javascript
import { Collider } from './collider.js'

// 클래스 내부에 추가
checkCollision(newX, newY, radius = 14) {
  const scene = this.object.parent
  if (!scene) return false

  // 타일맵 충돌 체크
  const tilemap = scene.tilemap
  if (tilemap && !tilemap.isPassableCircle(newX, newY, radius)) {
    return true
  }

  // 구조물 충돌 체크
  const structures = scene.objects.filter(obj => obj.tags?.has('structure'))
  for (const structure of structures) {
    const collider = structure.findComponent(Collider)
    if (collider && collider.collidesWithCircle(newX, newY, radius)) {
      return true
    }
  }

  return false
}
```

**Step 2: didUpdate()에서 이동 시 충돌 체크**

chase 상태의 이동 부분 수정:
```javascript
} else if (distance < this.detectionRange) {
  this.state = 'chase'
  const dirX = dx / distance
  const dirY = dy / distance

  const newX = pos[0] + dirX * this.speed * deltaTime
  const newY = pos[1] + dirY * this.speed * deltaTime

  // X축 이동 시도
  if (!this.checkCollision(newX, pos[1])) {
    pos[0] = newX
  }
  // Y축 이동 시도
  if (!this.checkCollision(pos[0], newY)) {
    pos[1] = newY
  }
} else {
```

**Step 3: 커밋**

```bash
git add examples/mini-rpg/scripts/components/enemy-ai.js
git commit -m "feat(mini-rpg): EnemyAI 충돌 처리 추가"
```

---

## Task 10: 적 스폰 시 충돌 회피

**Files:**
- Modify: `examples/mini-rpg/scripts/scenes/game-scene.js`

**Step 1: spawnRandomEnemy() 수정**

```javascript
spawnRandomEnemy() {
  const playerPos = this.player.position
  let x, y, attempts = 0

  do {
    x = Math.random() * this.mapSize[0]
    y = Math.random() * this.mapSize[1]

    // 플레이어로부터 거리 체크
    const dx = x - playerPos[0]
    const dy = y - playerPos[1]
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 200) {
      attempts++
      continue
    }

    // 타일맵 통과 가능 체크
    if (!this.tilemap.isPassable(x, y)) {
      attempts++
      continue
    }

    // 구조물과 겹침 체크
    let overlaps = false
    const structures = this.objects.filter(obj => obj.tags?.has('structure'))
    for (const s of structures) {
      const collider = s.findComponent(Collider)
      if (collider && collider.collidesWithCircle(x, y, 20)) {
        overlaps = true
        break
      }
    }
    if (overlaps) {
      attempts++
      continue
    }

    break
  } while (attempts < 20)

  if (attempts >= 20) return // 유효한 위치 못 찾음

  const enemy = Math.random() > 0.4 ? createMushroom(x, y) : createAnt(x, y)
  const ai = enemy.findComponent(EnemyAI)
  ai.setTarget(this.player)
  this.add(enemy)
}
```

**Step 2: 커밋**

```bash
git add examples/mini-rpg/scripts/scenes/game-scene.js
git commit -m "feat(mini-rpg): 적 스폰 시 충돌 회피"
```

---

## Task 11: 렌더링 순서 조정

**Files:**
- Modify: `examples/mini-rpg/scripts/scenes/game-scene.js`

**Step 1: didCreate()에서 객체 추가 순서 조정**

객체 추가 순서를 조정하여 렌더링 순서 보장:
1. 타일맵 (가장 먼저)
2. 구조물
3. 적
4. 플레이어
5. HUD (가장 나중)

현재 코드에서 순서가 이미 맞다면 확인만 하고 넘어감.

**Step 2: 커밋 (변경 있을 경우)**

```bash
git add examples/mini-rpg/scripts/scenes/game-scene.js
git commit -m "refactor(mini-rpg): 렌더링 순서 조정"
```

---

## Task 12: 최종 테스트 및 정리

**Step 1: 브라우저에서 게임 테스트**

확인 사항:
- [ ] 타일맵이 올바르게 렌더링되는가
- [ ] 구조물(나무, 바위)이 보이는가
- [ ] 플레이어가 물/벽 타일에 막히는가
- [ ] 플레이어가 구조물에 막히는가
- [ ] 적이 구조물/타일에 막히는가
- [ ] 적이 유효한 위치에만 스폰되는가
- [ ] 카메라가 플레이어를 따라가는가

**Step 2: 콘솔 오류 확인 및 수정**

**Step 3: 최종 커밋**

```bash
git add -A
git commit -m "feat(mini-rpg): 지형 및 구조물 시스템 완성"
```

**Step 4: develop에 푸시**

```bash
git push origin develop
```
