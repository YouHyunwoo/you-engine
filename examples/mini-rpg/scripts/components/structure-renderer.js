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
