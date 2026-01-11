import { EventEmitter } from '../utilities/event.js'
import { Particle } from './particle.js'
import { parseColor, lerpColor, colorToString } from './color.js'

export class ParticleEmitter {
  constructor({
    position = [0, 0],
    rate = 10,
    maxParticles = 100,
    duration = Infinity,

    shape = 'circle',
    image = null,
    blendMode = 'source-over',

    lifetime = [1, 1],
    speed = [50, 100],
    direction = [0, 360],
    spread = 0,
    rotation = [0, 0],
    rotationSpeed = [0, 0],

    size = { from: 8, to: 8 },
    alpha = { from: 1, to: 1 },
    color = { from: '#ffffff', to: '#ffffff' },
    scale = { from: 1, to: 1 },

    gravity = [0, 0],
    friction = 0,
  } = {}) {
    this.position = [...position]
    this.rate = rate
    this.maxParticles = maxParticles
    this.duration = duration

    this.shape = shape
    this.image = image
    this.blendMode = blendMode

    this._lifetime = this._normalizeRange(lifetime)
    this._speed = this._normalizeRange(speed)
    this._direction = this._normalizeRange(direction)
    this._spread = spread
    this._rotation = this._normalizeRange(rotation)
    this._rotationSpeed = this._normalizeRange(rotationSpeed)

    this._size = this._normalizeTransition(size)
    this._alpha = this._normalizeTransition(alpha)
    this._color = {
      from: parseColor(color.from ?? color),
      to: parseColor(color.to ?? color),
      easing: color.easing ?? null,
    }
    this._scale = this._normalizeTransition(scale)

    this._gravity = [...gravity]
    this._friction = friction

    this.event = new EventEmitter(this)

    this._particles = []
    this._pool = []
    this._running = false
    this._spawnAccumulator = 0
    this._durationElapsed = 0
    this._durationEnded = false
  }

  _normalizeRange(value) {
    if (Array.isArray(value)) return value
    return [value, value]
  }

  _normalizeTransition(value) {
    if (typeof value === 'number') {
      return { from: value, to: value, easing: null }
    }
    return {
      from: value.from ?? value,
      to: value.to ?? value,
      easing: value.easing ?? null,
    }
  }

  get running() {
    return this._running
  }

  get particleCount() {
    return this._particles.length
  }

  start() {
    if (this._running) return

    this._running = true
    this._durationElapsed = 0
    this._durationEnded = false
    this.event.emit('start')
  }

  stop() {
    if (!this._running) return

    this._running = false
    this.event.emit('stop')
  }

  burst(count) {
    const available = this.maxParticles - this._particles.length
    const toSpawn = Math.min(count, available)

    for (let i = 0; i < toSpawn; i++) {
      this._spawnParticle()
    }
  }

  clear() {
    for (const particle of this._particles) {
      this._pool.push(particle)
    }
    this._particles = []
  }

  reset() {
    this.clear()
    this._running = false
    this._spawnAccumulator = 0
    this._durationElapsed = 0
    this._durationEnded = false
  }

  setPosition(x, y) {
    this.position[0] = x
    this.position[1] = y
  }

  setRate(rate) {
    this.rate = rate
  }

  _randomRange(range) {
    return range[0] + Math.random() * (range[1] - range[0])
  }

  _spawnParticle() {
    let particle = this._pool.pop()
    if (!particle) {
      particle = new Particle()
    }

    const spawnX = this.position[0] + (Math.random() - 0.5) * 2 * this._spread
    const spawnY = this.position[1] + (Math.random() - 0.5) * 2 * this._spread

    const speed = this._randomRange(this._speed)
    const directionDeg = this._randomRange(this._direction)
    const directionRad = directionDeg * Math.PI / 180
    const vx = Math.cos(directionRad) * speed
    const vy = Math.sin(directionRad) * speed

    particle.reset({
      position: [spawnX, spawnY],
      velocity: [vx, vy],
      lifetime: this._randomRange(this._lifetime),
      gravity: this._gravity,
      friction: this._friction,
      size: this._size.from,
      alpha: this._alpha.from,
      color: colorToString(this._color.from),
      rotation: this._randomRange(this._rotation) * Math.PI / 180,
      rotationSpeed: this._randomRange(this._rotationSpeed) * Math.PI / 180,
    })

    this._particles.push(particle)
    this.event.emit('particleSpawn', particle)
  }

  _interpolate(transition, progress) {
    const t = transition.easing ? transition.easing(progress) : progress
    return transition.from + (transition.to - transition.from) * t
  }

  update(deltaTime) {
    // duration 체크
    if (this._running && this.duration !== Infinity) {
      this._durationElapsed += deltaTime
      if (this._durationElapsed >= this.duration) {
        this.stop()
        this._durationEnded = true
      }
    }

    // 연속 생성
    if (this._running && this.rate > 0) {
      this._spawnAccumulator += deltaTime * this.rate
      while (this._spawnAccumulator >= 1 && this._particles.length < this.maxParticles) {
        this._spawnParticle()
        this._spawnAccumulator -= 1
      }
    }

    // 파티클 업데이트
    const deadParticles = []

    for (const particle of this._particles) {
      particle.update(deltaTime)

      // 시간에 따른 속성 변화
      const progress = particle.progress
      particle.size = this._interpolate(this._size, progress)
      particle.alpha = this._interpolate(this._alpha, progress)

      const colorT = this._color.easing ? this._color.easing(progress) : progress
      const rgba = lerpColor(this._color.from, this._color.to, colorT)
      particle.color = colorToString(rgba)

      if (!particle.alive) {
        deadParticles.push(particle)
      }
    }

    // 죽은 파티클 처리
    for (const particle of deadParticles) {
      const index = this._particles.indexOf(particle)
      if (index >= 0) {
        this._particles.splice(index, 1)
        this._pool.push(particle)
        this.event.emit('particleDeath', particle)
      }
    }

    // empty 이벤트
    if (deadParticles.length > 0 && this._particles.length === 0) {
      this.event.emit('empty')

      if (this._durationEnded) {
        this.event.emit('complete')
      }
    }
  }
}
