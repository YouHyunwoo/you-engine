import { View } from '../../../../you/ui/view.js'
import { Stats } from '../components/stats.js'

export class HUD extends View {
  constructor() {
    super()
    this.player = null
  }

  setPlayer(player) {
    this.player = player
  }

  didRender(context, screen) {
    if (!this.player) return

    const stats = this.player.findComponent(Stats)
    if (!stats) return

    const padding = 20

    // HP 바 (좌상단)
    this.renderHpBar(context, padding, padding, stats)

    // 레벨/경험치 (HP 바 아래)
    this.renderLevelInfo(context, padding, padding + 30, stats)
  }

  renderHpBar(context, x, y, stats) {
    const width = 200
    const height = 20

    // 라벨
    context.fillStyle = '#ffffff'
    context.font = '14px Arial'
    context.fillText('HP', x, y + 14)

    // 배경
    const barX = x + 30
    context.fillStyle = '#333333'
    context.fillRect(barX, y, width, height)

    // HP
    const ratio = stats.hp / stats.maxHp
    context.fillStyle = ratio > 0.3 ? '#44dd44' : '#dd4444'
    context.fillRect(barX, y, width * ratio, height)

    // 테두리
    context.strokeStyle = '#ffffff'
    context.lineWidth = 2
    context.strokeRect(barX, y, width, height)

    // 수치
    context.fillStyle = '#ffffff'
    context.fillText(`${stats.hp}/${stats.maxHp}`, barX + width + 10, y + 14)
  }

  renderLevelInfo(context, x, y, stats) {
    context.fillStyle = '#ffffff'
    context.font = '14px Arial'
    context.fillText(`Lv.${stats.level}`, x, y + 14)

    // 경험치 바
    const expToLevel = stats.level * 100
    const expRatio = stats.exp / expToLevel
    const barX = x + 50
    const width = 100
    const height = 10

    context.fillStyle = '#333333'
    context.fillRect(barX, y + 5, width, height)

    context.fillStyle = '#4488dd'
    context.fillRect(barX, y + 5, width * expRatio, height)
  }
}
