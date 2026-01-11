import { Audio } from './audio.js'
import { EventEmitter } from '../utilities/event.js'

/**
 * 오디오 매니저
 *
 * 여러 사운드를 관리하고 풀링을 통해 동시 재생을 지원한다.
 *
 * @example
 * const manager = new AudioManager()
 * await manager.load('bgm', 'music.mp3')
 * await manager.load('gunshot', 'gun.mp3', 3)  // 동시 3개
 *
 * manager.play('bgm', { volume: 0.8, loop: true })
 * manager.play('gunshot')
 */
export class AudioManager {
  constructor() {
    this.event = new EventEmitter(this)

    this._pools = {}  // { id: Audio[] }
    this._masterVolume = 1.0
    this._muted = false
  }

  get masterVolume() {
    return this._masterVolume
  }

  set masterVolume(value) {
    this._masterVolume = Math.max(0, Math.min(1, value))
    this._updateAllVolumes()
  }

  get muted() {
    return this._muted
  }

  async load(id, src, poolSize = 1) {
    const pool = []

    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio({ src })

      audio.event.on('error', (error) => {
        this.event.emit('error', id, error)
      })

      pool.push(audio)
    }

    // 모든 인스턴스 로드 대기
    await Promise.all(pool.map(audio => audio.loadPromise))

    this._pools[id] = pool
    this.event.emit('load', id)

    // 모든 사운드 로드 완료 확인
    const allLoaded = Object.values(this._pools).every(
      pool => pool.every(audio => audio.loaded)
    )
    if (allLoaded && Object.keys(this._pools).length > 0) {
      this.event.emit('loadAll')
    }
  }

  _updateAllVolumes() {
    for (const pool of Object.values(this._pools)) {
      for (const audio of pool) {
        const baseVolume = audio._baseVolume ?? 1.0
        audio.volume = baseVolume * this._masterVolume * (this._muted ? 0 : 1)
      }
    }
  }

  play(id, { volume = 1.0, loop = false } = {}) {
    const pool = this._pools[id]
    if (!pool) {
      console.warn(`Audio '${id}' not loaded`)
      return null
    }

    // 사용 가능한 인스턴스 찾기
    let instance = pool.find(audio => !audio.playing)

    // 없으면 가장 오래된 것 재사용 (첫 번째)
    if (!instance) {
      instance = pool[0]
      instance.stop()
    }

    // 옵션 설정
    instance._baseVolume = volume
    instance.volume = volume * this._masterVolume * (this._muted ? 0 : 1)
    instance.loop = loop

    instance.play()
    return instance
  }
}
