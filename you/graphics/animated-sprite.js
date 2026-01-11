import { Sprite } from './sprite.js'
import { SpriteAnimation } from './sprite-animation.js'
import { EventEmitter } from '../utilities/event.js'

/**
 * 애니메이티드 스프라이트
 *
 * 여러 SpriteAnimation을 관리하여 상태별 애니메이션 전환을 지원한다.
 *
 * @example
 * const sprite = new AnimatedSprite({
 *   sheet: myImage,
 *   animations: {
 *     idle: { grid: { cols: 4, rows: 2, start: 0, count: 4 }, fps: 8 },
 *     walk: { grid: { cols: 4, rows: 2, start: 4, count: 4 }, fps: 12 },
 *   },
 *   default: 'idle',
 * });
 *
 * sprite.play('walk');
 * sprite.update(deltaTime);
 * sprite.render(context, x, y);
 */
export class AnimatedSprite {
  constructor({
    sheet,
    scale = [1, 1],
    anchor = [0, 0],
    animations,
    default: defaultAnim = null,
  }) {
    if (!sheet) throw new Error('sheet is required')
    if (!animations) throw new Error('animations is required')

    this.sheet = sheet
    this.scale = scale
    this.anchor = anchor
    this.event = new EventEmitter(this)

    // 내부 Sprite 생성
    this._sprite = new Sprite({ sheet, scale, anchor })

    // 애니메이션들 생성
    this._animations = {}
    for (const [name, config] of Object.entries(animations)) {
      const animation = new SpriteAnimation({
        sprite: this._sprite,
        frames: config.frames,
        grid: config.grid,
        fps: config.fps ?? 12,
        loop: config.loop ?? true,
      })

      // 이벤트 위임
      animation.event.on('frameChange', (frameIndex) => {
        this.event.emit('frameChange', name, frameIndex)
      })

      animation.event.on('complete', () => {
        this.event.emit('complete', name)
      })

      animation.event.on('loopComplete', () => {
        this.event.emit('loopComplete', name)
      })

      this._animations[name] = animation
    }

    this._current = null
    this._currentAnimation = null

    // 기본 애니메이션 설정
    if (defaultAnim) {
      this._setCurrent(defaultAnim)
    }
  }

  get current() {
    return this._current
  }

  get playing() {
    return this._currentAnimation?.playing ?? false
  }

  get currentFrame() {
    return this._currentAnimation?.currentFrame ?? 0
  }

  _setCurrent(name) {
    if (!this._animations[name]) {
      throw new Error(`Animation "${name}" not found`)
    }
    this._current = name
    this._currentAnimation = this._animations[name]
  }

  play(name) {
    if (name === this._current) {
      this._currentAnimation?.play()
      return
    }

    this._setCurrent(name)
    this._currentAnimation?.stop()
    this._currentAnimation?.play()
    this.event.emit('change', name)
  }

  pause() {
    this._currentAnimation?.pause()
  }

  stop() {
    this._currentAnimation?.stop()
  }

  update(deltaTime) {
    this._currentAnimation?.update(deltaTime)
  }

  render(context, x = 0, y = 0) {
    this._currentAnimation?.render(context, x, y)
  }
}
