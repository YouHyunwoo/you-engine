import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Audio } from '../you/audio/audio.js'

// Web Audio API Mock
const createMockAudioContext = () => {
  const gainNode = {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const sourceNode = {
    buffer: null,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  }

  return {
    state: 'running',
    currentTime: 0,
    destination: {},
    createGain: vi.fn(() => gainNode),
    createBufferSource: vi.fn(() => sourceNode),
    decodeAudioData: vi.fn((buffer) => Promise.resolve({ duration: 10 })),
    resume: vi.fn(() => Promise.resolve()),
    _gainNode: gainNode,
    _sourceNode: sourceNode,
  }
}

// fetch Mock
const mockFetch = (success = true) => {
  global.fetch = vi.fn(() =>
    success
      ? Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)) })
      : Promise.reject(new Error('Failed to fetch'))
  )
}

describe('Audio', () => {
  let mockContext

  beforeEach(() => {
    mockContext = createMockAudioContext()
    // 클래스처럼 동작하는 생성자 mock
    global.AudioContext = function() { return mockContext }
    global.webkitAudioContext = function() { return mockContext }
    mockFetch(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
    Audio._context = null  // 싱글톤 리셋
  })

  describe('생성자', () => {
    it('src로 생성할 수 있다', () => {
      const audio = new Audio({ src: 'test.mp3' })

      expect(audio.src).toBe('test.mp3')
    })

    it('기본 volume은 1.0이다', () => {
      const audio = new Audio({ src: 'test.mp3' })

      expect(audio.volume).toBe(1.0)
    })

    it('기본 loop는 false이다', () => {
      const audio = new Audio({ src: 'test.mp3' })

      expect(audio.loop).toBe(false)
    })

    it('옵션으로 volume, loop를 설정할 수 있다', () => {
      const audio = new Audio({ src: 'test.mp3', volume: 0.5, loop: true })

      expect(audio.volume).toBe(0.5)
      expect(audio.loop).toBe(true)
    })

    it('src가 없으면 에러를 던진다', () => {
      expect(() => new Audio({})).toThrow()
    })
  })

  describe('로딩', () => {
    it('생성 시 자동으로 로드한다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise

      expect(global.fetch).toHaveBeenCalledWith('test.mp3')
      expect(audio.loaded).toBe(true)
    })

    it('로드 완료 시 load 이벤트가 발생한다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      const loadHandler = vi.fn()
      audio.event.on('load', loadHandler)

      await audio.loadPromise

      expect(loadHandler).toHaveBeenCalled()
    })

    it('로드 실패 시 error 이벤트가 발생한다', async () => {
      mockFetch(false)
      const audio = new Audio({ src: 'test.mp3' })
      const errorHandler = vi.fn()
      audio.event.on('error', errorHandler)

      try { await audio.loadPromise } catch (e) {}

      expect(errorHandler).toHaveBeenCalled()
    })

    it('duration은 로드 후 사용 가능하다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise

      expect(audio.duration).toBe(10)
    })
  })

  describe('재생 제어', () => {
    it('play()로 재생한다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise

      audio.play()

      expect(mockContext.createBufferSource).toHaveBeenCalled()
      expect(mockContext._sourceNode.start).toHaveBeenCalled()
      expect(audio.playing).toBe(true)
    })

    it('pause()로 일시 정지한다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise

      audio.play()
      audio.pause()

      expect(audio.playing).toBe(false)
    })

    it('stop()으로 정지하고 처음으로 돌아간다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise

      audio.play()
      audio.stop()

      expect(audio.playing).toBe(false)
      expect(audio.currentTime).toBe(0)
    })

    it('재생 완료 시 end 이벤트가 발생한다', async () => {
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise
      const endHandler = vi.fn()
      audio.event.on('end', endHandler)

      audio.play()
      // onended 콜백 시뮬레이션
      mockContext._sourceNode.onended?.()

      expect(endHandler).toHaveBeenCalled()
    })

    it('loop=true면 반복 재생한다', async () => {
      const audio = new Audio({ src: 'test.mp3', loop: true })
      await audio.loadPromise

      audio.play()

      expect(mockContext._sourceNode.loop).toBe(true)
    })

    it('로드 전에 play()를 호출하면 무시된다', () => {
      const audio = new Audio({ src: 'test.mp3' })

      audio.play()

      expect(audio.playing).toBe(false)
    })
  })
})
