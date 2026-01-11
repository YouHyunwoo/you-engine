import { EventEmitter } from '../utilities/event.js'

/**
 * 스프라이트 애니메이션
 *
 * 스프라이트 시트에서 프레임 시퀀스를 재생한다.
 *
 * @example
 * const animation = new SpriteAnimation({
 *   sprite: mySprite,
 *   grid: { cols: 4, start: 0, count: 8 },
 *   fps: 12,
 *   loop: true,
 * });
 *
 * animation.play();
 * animation.update(deltaTime);
 * animation.render(context, x, y);
 */
export class SpriteAnimation {
  constructor({
    sprite,
    frames = null,
    grid = null,
    fps = 12,
    loop = true,
  }) {
    if (!sprite) throw new Error('sprite is required')
    if (!frames && !grid) throw new Error('frames or grid is required')

    this.sprite = sprite
    this.fps = fps
    this.loop = loop
    this.event = new EventEmitter(this)

    // 프레임 배열 생성
    if (frames) {
      this.frames = frames.map(f => [...f])
    } else {
      this.frames = this._generateFramesFromGrid(grid)
    }

    this._currentFrame = 0
    this._playing = false
    this._elapsed = 0
  }

  _generateFramesFromGrid(grid) {
    const { cols, rows = 1, frameWidth, frameHeight, start = 0, count } = grid

    const width = frameWidth ?? Math.floor(this.sprite.sheet.width / cols)
    const height = frameHeight ?? Math.floor(this.sprite.sheet.height / rows)

    const frames = []
    for (let i = 0; i < count; i++) {
      const index = start + i
      const col = index % cols
      const row = Math.floor(index / cols)
      frames.push([col * width, row * height, width, height])
    }

    return frames
  }

  get frameCount() {
    return this.frames.length
  }

  get currentFrame() {
    return this._currentFrame
  }

  set currentFrame(value) {
    this._currentFrame = Math.max(0, Math.min(value, this.frames.length - 1))
  }

  get playing() {
    return this._playing
  }

  play() {
    this._playing = true
  }

  pause() {
    this._playing = false
  }

  stop() {
    this._playing = false
    this._currentFrame = 0
    this._elapsed = 0
  }

  update(deltaTime) {
    if (!this._playing) return

    this._elapsed += deltaTime
    const frameDuration = 1000 / this.fps

    while (this._elapsed >= frameDuration) {
      this._elapsed -= frameDuration
      this._advanceFrame()
    }
  }

  _advanceFrame() {
    const nextFrame = this._currentFrame + 1

    if (nextFrame >= this.frames.length) {
      if (this.loop) {
        this._currentFrame = 0
        this.event.emit('loopComplete')
        this.event.emit('frameChange', this._currentFrame)
      } else {
        this._playing = false
        this.event.emit('complete')
      }
    } else {
      this._currentFrame = nextFrame
      this.event.emit('frameChange', this._currentFrame)
    }
  }

  render(context, x, y) {
    const frame = this.frames[this._currentFrame]
    this.sprite.croppingArea = frame
    this.sprite.render(context, x, y)
  }
}
