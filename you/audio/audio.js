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
    if (!this.duration || this.duration === 0) return 0
    return (Audio.context.currentTime - this._startTime) % this.duration
  }

  set currentTime(value) {
    const wasPlaying = this._playing
    if (wasPlaying) this.stop()
    this._pauseTime = value
    if (wasPlaying) this.play()
  }

  play() {
    if (!this._loaded || this._playing) return

    // AudioContext 재개 (브라우저 정책)
    if (Audio.context.state === 'suspended') {
      Audio.context.resume()
    }

    this._createSource()
    this._source.start(0, this._pauseTime)
    this._startTime = Audio.context.currentTime - this._pauseTime
    this._playing = true
  }

  pause() {
    if (!this._playing) return

    this._pauseTime = this.currentTime
    this._destroySource()
    this._playing = false
  }

  stop() {
    if (this._playing) {
      this._destroySource()
    }
    this._playing = false
    this._pauseTime = 0
  }

  _createSource() {
    this._source = Audio.context.createBufferSource()
    this._source.buffer = this._buffer
    this._source.loop = this._loop

    this._gainNode = Audio.context.createGain()
    this._gainNode.gain.value = this._volume

    this._source.connect(this._gainNode)
    this._gainNode.connect(Audio.context.destination)

    this._source.onended = () => {
      if (this._playing && !this._loop) {
        this._playing = false
        this._pauseTime = 0
        this.event.emit('end')
      }
    }
  }

  _destroySource() {
    if (this._source) {
      this._source.stop()
      this._source.disconnect()
      this._source = null
    }
    if (this._gainNode) {
      this._gainNode.disconnect()
      this._gainNode = null
    }
  }

  fadeIn(duration) {
    if (!this._loaded) return

    const targetVolume = this._volume
    this._volume = 0

    if (!this._playing) {
      this.play()
    }

    const currentTime = Audio.context.currentTime
    this._gainNode.gain.setValueAtTime(0, currentTime)
    this._gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + duration / 1000)

    this._volume = targetVolume
  }

  fadeOut(duration) {
    if (!this._loaded || !this._gainNode) return

    const currentTime = Audio.context.currentTime
    this._gainNode.gain.setValueAtTime(this._gainNode.gain.value, currentTime)
    this._gainNode.gain.linearRampToValueAtTime(0, currentTime + duration / 1000)

    setTimeout(() => {
      this.stop()
    }, duration)
  }
}
