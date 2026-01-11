import { Scene } from '../../../../you/scene.js'
import { createPlayer } from '../objects/player.js'
import { createMushroom, createAnt } from '../objects/enemy.js'
import { PlayerController } from '../components/player-controller.js'
import { EnemyAI } from '../components/enemy-ai.js'
import { AttackController } from '../components/attack-controller.js'
import { Stats } from '../components/stats.js'
import { ShapeRenderer } from '../components/shape-renderer.js'
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

    this.spawnEnemies()

    // HUD 추가
    const hud = new HUD()
    hud.setPlayer(player)
    this.add(hud)
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

  didRender(context) {
    context.fillStyle = '#3d5a3d'
    context.fillRect(0, 0, this.mapSize[0], this.mapSize[1])
  }

  gameOver() {
    // 약간의 딜레이 후 게임오버 씬으로 전환
    setTimeout(() => {
      this.transit(new GameOverScene())
    }, 500)
  }
}
