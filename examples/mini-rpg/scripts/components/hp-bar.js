import { Component } from '../../../../you/component.js'
import { Stats } from './stats.js'

export class HpBar extends Component {
  constructor({
    width = 40,
    height = 6,
    offsetY = -25,
    bgColor = '#333333',
    fgColor = '#44dd44',
    lowColor = '#dd4444'
  } = {}) {
    super()
    this.width = width
    this.height = height
    this.offsetY = offsetY
    this.bgColor = bgColor
    this.fgColor = fgColor
    this.lowColor = lowColor
  }

  didRender(context) {
    const stats = this.object.findComponent(Stats)
    if (!stats) return

    const pos = this.object.position
    const x = pos[0] - this.width / 2
    const y = pos[1] + this.offsetY

    // 배경
    context.fillStyle = this.bgColor
    context.fillRect(x, y, this.width, this.height)

    // HP 바
    const ratio = stats.hp / stats.maxHp
    const barWidth = this.width * ratio
    context.fillStyle = ratio > 0.3 ? this.fgColor : this.lowColor
    context.fillRect(x, y, barWidth, this.height)
  }
}
