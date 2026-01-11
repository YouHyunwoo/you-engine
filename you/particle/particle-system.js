import { EventEmitter } from '../utilities/event.js'

export class ParticleSystem {
  constructor() {
    this.event = new EventEmitter(this)
    this._emitters = new Map()
  }

  add(name, emitter) {
    this._emitters.set(name, emitter)
  }

  remove(name) {
    const emitter = this._emitters.get(name)
    if (emitter) {
      emitter.reset()
      this._emitters.delete(name)
    }
  }

  get(name) {
    return this._emitters.get(name)
  }

  play(name, position = null, options = {}) {
    const emitter = this._emitters.get(name)
    if (!emitter) {
      console.warn(`Emitter '${name}' not found`)
      return
    }

    if (position) {
      emitter.setPosition(position[0], position[1])
    }

    if (options.burst) {
      emitter.burst(options.burst)
    } else {
      emitter.start()
    }
  }

  stop(name) {
    const emitter = this._emitters.get(name)
    if (emitter) {
      emitter.stop()
    }
  }

  stopAll() {
    for (const emitter of this._emitters.values()) {
      emitter.stop()
    }
  }

  clear(name) {
    const emitter = this._emitters.get(name)
    if (emitter) {
      emitter.clear()
    }
  }

  clearAll() {
    for (const emitter of this._emitters.values()) {
      emitter.clear()
    }
  }

  update(deltaTime) {
    for (const emitter of this._emitters.values()) {
      emitter.update(deltaTime)
    }
  }

  render(context) {
    for (const emitter of this._emitters.values()) {
      emitter.render(context)
    }
  }

  get totalParticleCount() {
    let count = 0
    for (const emitter of this._emitters.values()) {
      count += emitter.particleCount
    }
    return count
  }
}
