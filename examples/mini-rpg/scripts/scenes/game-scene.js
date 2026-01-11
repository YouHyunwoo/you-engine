import { Scene } from '../../../../you/scene.js'
import { Object } from '../../../../you/object.js'
import { createPlayer } from '../objects/player.js'
import { createMushroom, createAnt } from '../objects/enemy.js'
import { createTree, createRock } from '../objects/structure.js'
import { PlayerController } from '../components/player-controller.js'
import { EnemyAI } from '../components/enemy-ai.js'
import { AttackController } from '../components/attack-controller.js'
import { Stats } from '../components/stats.js'
import { ShapeRenderer } from '../components/shape-renderer.js'
import { Collider } from '../components/collider.js'
import { TileMap } from '../components/tilemap.js'
import { FOREST_MAP } from '../data/maps.js'
import { HUD } from '../ui/hud.js'
import { GameOverScene } from './gameover-scene.js'

export class GameScene extends Scene {
  willCreate() {
    this.mapSize = [1600, 1200]
    this.respawnTimer = 0
    this.respawnInterval = 5 // 5초마다 리스폰 체크
    this.maxEnemies = 10
  }

  didCreate() {
    // 타일맵 오브젝트 생성
    const mapObject = new Object({ name: 'tilemap' })
    this.tilemap = new TileMap({ tiles: FOREST_MAP, tileSize: 16 })
    mapObject.addComponent(this.tilemap)
    mapObject.position = [0, 0]
    this.add(mapObject)

    const player = createPlayer(400, 300)
    this.add(player)

    // 플레이어 경계 설정
    const controller = player.findComponent(PlayerController)
    controller.setBounds(0, 0, this.mapSize[0], this.mapSize[1])

    // 카메라가 플레이어를 따라가도록
    this.player = player

    // 레벨업 이벤트
    const playerStats = player.findComponent(Stats)
    playerStats.event.on('levelUp', (level) => {
      console.log(`Level Up! Now level ${level}`)
    })

    // 플레이어 사망 이벤트
    playerStats.event.on('death', () => {
      this.gameOver()
    })

    this.spawnStructures(30)

    this.spawnEnemies()

    // HUD 추가
    const hud = new HUD()
    hud.setPlayer(player)
    this.add(hud)
  }

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

    // 공격 입력
    for (const ev of events) {
      if (ev.type === 'keydown' && (ev.key === ' ' || ev.key === 'j')) {
        this.playerAttack()
      }
    }

    // 죽은 적 제거
    this.removeDeadEnemies()

    // 리스폰 체크
    this.respawnTimer += deltaTime
    if (this.respawnTimer >= this.respawnInterval) {
      this.respawnTimer = 0
      this.checkRespawn()
    }
  }

  playerAttack() {
    const attackController = this.player.findComponent(AttackController)
    const enemies = this.objects.filter(obj => obj.tags.has('enemy'))
    const hits = attackController.attack(enemies)

    for (const hit of hits) {
      console.log(`Hit ${hit.target.name} for ${hit.damage} damage`)

      // 피격 이펙트
      const renderer = hit.target.findComponent(ShapeRenderer)
      if (renderer) {
        renderer.flash('#ffffff', 0.1)
      }

      const targetStats = hit.target.findComponent(Stats)
      if (!targetStats.alive) {
        // 경험치 획득
        const playerStats = this.player.findComponent(Stats)
        playerStats.addExp(hit.target.expReward || 10)
        console.log(`Gained ${hit.target.expReward} EXP`)
      }
    }
  }

  removeDeadEnemies() {
    const enemies = this.objects.filter(obj => obj.tags.has('enemy'))
    for (const enemy of enemies) {
      const stats = enemy.findComponent(Stats)
      if (stats && !stats.alive) {
        this.remove(enemy)
      }
    }
  }

  checkRespawn() {
    const enemies = this.objects.filter(obj => obj.tags.has('enemy'))
    const count = enemies.length

    if (count < this.maxEnemies) {
      const toSpawn = Math.min(3, this.maxEnemies - count)
      for (let i = 0; i < toSpawn; i++) {
        this.spawnRandomEnemy()
      }
    }
  }

  spawnRandomEnemy() {
    // 플레이어로부터 일정 거리 떨어진 곳에 스폰
    const playerPos = this.player.position
    let x, y, attempts = 0

    do {
      x = Math.random() * this.mapSize[0]
      y = Math.random() * this.mapSize[1]
      const dx = x - playerPos[0]
      const dy = y - playerPos[1]
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 200) break
      attempts++
    } while (attempts < 10)

    const enemy = Math.random() > 0.4 ? createMushroom(x, y) : createAnt(x, y)
    const ai = enemy.findComponent(EnemyAI)
    ai.setTarget(this.player)
    this.add(enemy)
  }

  gameOver() {
    // 약간의 딜레이 후 게임오버 씬으로 전환
    setTimeout(() => {
      this.transit(new GameOverScene())
    }, 500)
  }
}
