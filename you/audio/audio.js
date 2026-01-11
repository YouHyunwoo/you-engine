import { EventEmitter } from '../utilities/event.js'

/**
 * 오디오
 *
 * Web Audio API를 래핑하여 단일 사운드 제어를 담당한다.
 *
 * @example
 * const audio = new Audio({ src: 'music.mp3', volume: 0.8, loop: true })
 * await audio.loadPromise
 * audio.play()
 */
export class Audio {
  static _context = null

  static get context() {
    if (!Audio._context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      Audio._context = new AudioContextClass()
    }
    return Audio._context
  }

  constructor({ src, volume = 1.0, loop = false }) {
    if (!src) throw new Error('src is required')

    this.src = src
    this._volume = volume
    this._loop = loop
    this.event = new EventEmitter(this)

    this._buffer = null
    this._source = null
    this._gainNode = null
    this._loaded = false
    this._playing = false
    this._startTime = 0
    this._pauseTime = 0

    this.loadPromise = this._load()
  }

  async _load() {
    try {
      const response = await fetch(this.src)
      const arrayBuffer = await response.arrayBuffer()
      this._buffer = await Audio.context.decodeAudioData(arrayBuffer)
      this._loaded = true
      this.event.emit('load')
    } catch (error) {
      this.event.emit('error', error)
      throw error
    }
  }

  get loaded() {
    return this._loaded
  }

  get duration() {
    return this._buffer?.duration ?? 0
  }

  get volume() {
    return this._volume
  }

  set volume(value) {
    this._volume = Math.max(0, Math.min(1, value))
    if (this._gainNode) {
      this._gainNode.gain.value = this._volume
    }
  }

  get loop() {
    return this._loop
  }

  set loop(value) {
    this._loop = value
    if (this._source) {
      this._source.loop = value
    }
  }

  get playing() {
    return this._playing
  }

  get currentTime() {
    if (!this._playing) return this._pauseTime
    return (Audio.context.currentTime - this._startTime) % this.duration
  }

  set currentTime(value) {
    const wasPlaying = this._playing
    if (wasPlaying) this.stop()
    this._pauseTime = value
    if (wasPlaying) this.play()
  }
}
