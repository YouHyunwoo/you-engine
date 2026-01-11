import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AudioManager } from '../you/audio/audio-manager.js'
import { Audio } from '../you/audio/audio.js'

// Audio 클래스 Mock
const createMockAudio = ({ src, volume, loop }) => ({
  src,
  volume: volume ?? 1.0,
  _baseVolume: volume ?? 1.0,
  loop: loop ?? false,
  loaded: true,
  playing: false,
  loadPromise: Promise.resolve(),
  play: vi.fn(function() { this.playing = true }),
  pause: vi.fn(function() { this.playing = false }),
  stop: vi.fn(function() { this.playing = false }),
  fadeIn: vi.fn(),
  fadeOut: vi.fn(),
  event: {
    on: vi.fn(),
    emit: vi.fn(),
  },
})

vi.mock('../you/audio/audio.js', () => ({
  Audio: vi.fn(function({ src, volume, loop }) {
    return createMockAudio({ src, volume, loop })
  }),
}))

describe('AudioManager', () => {
  let manager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new AudioManager()
  })

  describe('생성자', () => {
    it('생성할 수 있다', () => {
      expect(manager).toBeDefined()
    })

    it('기본 masterVolume은 1.0이다', () => {
      expect(manager.masterVolume).toBe(1.0)
    })

    it('기본 muted는 false이다', () => {
      expect(manager.muted).toBe(false)
    })
  })

  describe('load()', () => {
    it('사운드를 로드할 수 있다', async () => {
      await manager.load('bgm', 'music.mp3')

      expect(Audio).toHaveBeenCalledWith({ src: 'music.mp3' })
    })

    it('poolSize로 여러 인스턴스를 생성한다', async () => {
      await manager.load('gunshot', 'gun.mp3', 3)

      expect(Audio).toHaveBeenCalledTimes(3)
    })

    it('로드 완료 시 load 이벤트가 발생한다', async () => {
      const loadHandler = vi.fn()
      manager.event.on('load', loadHandler)

      await manager.load('bgm', 'music.mp3')

      expect(loadHandler).toHaveBeenCalledWith('bgm')
    })
  })

  describe('play()', () => {
    it('로드된 사운드를 재생한다', async () => {
      await manager.load('bgm', 'music.mp3')
      const instance = manager.play('bgm')

      expect(instance.play).toHaveBeenCalled()
    })

    it('options로 volume, loop를 설정한다', async () => {
      await manager.load('bgm', 'music.mp3')
      const instance = manager.play('bgm', { volume: 0.5, loop: true })

      expect(instance.volume).toBe(0.5)
      expect(instance.loop).toBe(true)
    })

    it('풀에서 사용 가능한 인스턴스를 사용한다', async () => {
      await manager.load('gunshot', 'gun.mp3', 2)

      const first = manager.play('gunshot')
      const second = manager.play('gunshot')

      expect(first).not.toBe(second)
    })

    it('풀이 가득 차면 가장 오래된 인스턴스를 재사용한다', async () => {
      await manager.load('gunshot', 'gun.mp3', 2)

      const first = manager.play('gunshot')
      manager.play('gunshot')
      const third = manager.play('gunshot')

      expect(first.stop).toHaveBeenCalled()
      expect(third).toBe(first)
    })

    it('존재하지 않는 사운드를 재생하면 null을 반환한다', () => {
      const result = manager.play('nonexistent')

      expect(result).toBeNull()
    })
  })
})
