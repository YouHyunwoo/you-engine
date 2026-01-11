import { Component } from '../../../../you/component.js'

export class ShapeRenderer extends Component {
  constructor({
    shape = 'circle',
    size = 32,
    color = '#ffffff',
    strokeColor = null,
    strokeWidth = 0
  } = {}) {
    super()
    this.shape = shape
    this.size = size
    this.color = color
    this.strokeColor = strokeColor
    this.strokeWidth = strokeWidth
    this.flashColor = null
    this.flashDuration = 0
  }

  flash(color, duration = 0.1) {
    this.flashColor = color
    this.flashDuration = duration
  }

  didUpdate(deltaTime) {
    if (this.flashDuration > 0) {
      this.flashDuration -= deltaTime
      if (this.flashDuration <= 0) {
        this.flashColor = null
      }
    }
  }

  didRender(context) {
    const pos = this.object.position
    const halfSize = this.size / 2
    const color = this.flashColor || this.color

    context.save()
    context.translate(pos[0], pos[1])

    if (this.shape === 'circle') {
      context.beginPath()
      context.arc(0, 0, halfSize, 0, Math.PI * 2)
      context.fillStyle = color
      context.fill()
      if (this.strokeColor) {
        context.strokeStyle = this.strokeColor
        context.lineWidth = this.strokeWidth
        context.stroke()
      }
    } else if (this.shape === 'rect') {
      context.fillStyle = color
      context.fillRect(-halfSize, -halfSize, this.size, this.size)
      if (this.strokeColor) {
        context.strokeStyle = this.strokeColor
        context.lineWidth = this.strokeWidth
        context.strokeRect(-halfSize, -halfSize, this.size, this.size)
      }
    }

    context.restore()
  }
}
