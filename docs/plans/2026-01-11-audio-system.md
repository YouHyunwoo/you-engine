# 오디오 시스템 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Web Audio API를 래핑한 게임 오디오 시스템 구현 (효과음 중첩 재생, 배경음악 페이드)

**Architecture:** Audio 클래스가 단일 사운드 제어(Web Audio API 래핑), AudioManager가 풀링으로 효과음 중첩 재생 관리 및 전역 볼륨 제어

**Tech Stack:** ES6 모듈, Web Audio API, Vitest (jsdom), EventEmitter

---

## Task 1: Audio 클래스 - 기본 구조 및 로딩

**Files:**
- Create: `you/audio/audio.js`
- Create: `tests/audio.test.js`

### Step 1: 테스트 파일 생성 - 기본 구조 및 로딩

```javascript
// tests/audio.test.js
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
    global.AudioContext = vi.fn(() => mockContext)
    global.webkitAudioContext = vi.fn(() => mockContext)
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
})
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/audio.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: Audio 기본 구조 및 로딩 구현

```javascript
// you/audio/audio.js
import { EventEmitter } from '../utilities/event.js'

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
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/audio.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/audio/audio.js tests/audio.test.js
git commit -m "feat(audio): Audio 클래스 기본 구조 및 로딩 추가

- Web Audio API 싱글톤 AudioContext
- fetch + decodeAudioData로 오디오 로드
- load/error 이벤트
- volume, loop, duration 속성"
```

---

## Task 2: Audio 클래스 - 재생 제어

**Files:**
- Modify: `you/audio/audio.js`
- Modify: `tests/audio.test.js`

### Step 1: 재생 제어 테스트 추가

```javascript
// tests/audio.test.js에 추가

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
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/audio.test.js`
Expected: FAIL - play, pause, stop 메서드 없음

### Step 3: 재생 제어 메서드 구현

```javascript
// you/audio/audio.js에 메서드 추가

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
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/audio.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/audio/audio.js tests/audio.test.js
git commit -m "feat(audio): Audio 재생 제어 메서드 추가

- play(): 재생 시작, AudioContext 자동 resume
- pause(): 일시 정지, currentTime 보존
- stop(): 정지 및 처음으로
- end 이벤트, loop 지원"
```

---

## Task 3: Audio 클래스 - 페이드 인/아웃

**Files:**
- Modify: `you/audio/audio.js`
- Modify: `tests/audio.test.js`

### Step 1: 페이드 테스트 추가

```javascript
// tests/audio.test.js에 추가

  describe('페이드', () => {
    it('fadeIn()으로 볼륨이 0에서 목표값으로 증가한다', async () => {
      const audio = new Audio({ src: 'test.mp3', volume: 0.8 })
      await audio.loadPromise

      audio.fadeIn(1000)

      expect(mockContext._gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, expect.any(Number))
      expect(mockContext._gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, expect.any(Number))
      expect(audio.playing).toBe(true)
    })

    it('fadeOut()으로 볼륨이 0으로 감소 후 정지한다', async () => {
      vi.useFakeTimers()
      const audio = new Audio({ src: 'test.mp3' })
      await audio.loadPromise

      audio.play()
      audio.fadeOut(1000)

      expect(mockContext._gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number))

      vi.advanceTimersByTime(1000)

      expect(audio.playing).toBe(false)
      vi.useRealTimers()
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/audio.test.js`
Expected: FAIL - fadeIn, fadeOut 메서드 없음

### Step 3: 페이드 메서드 구현

```javascript
// you/audio/audio.js에 메서드 추가

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
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/audio.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/audio/audio.js tests/audio.test.js
git commit -m "feat(audio): Audio 페이드 인/아웃 추가

- fadeIn(ms): 0에서 목표 볼륨으로 증가
- fadeOut(ms): 0으로 감소 후 정지
- Web Audio API linearRampToValueAtTime 활용"
```

---

## Task 4: AudioManager 클래스 - 기본 구조 및 로드

**Files:**
- Create: `you/audio/audio-manager.js`
- Create: `tests/audio-manager.test.js`

### Step 1: 테스트 파일 생성

```javascript
// tests/audio-manager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AudioManager } from '../you/audio/audio-manager.js'
import { Audio } from '../you/audio/audio.js'

// Audio 클래스 Mock
vi.mock('../you/audio/audio.js', () => ({
  Audio: vi.fn().mockImplementation(({ src, volume, loop }) => ({
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
  })),
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
})
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/audio-manager.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: AudioManager 기본 구조 구현

```javascript
// you/audio/audio-manager.js
import { Audio } from './audio.js'
import { EventEmitter } from '../utilities/event.js'

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
}
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/audio-manager.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/audio/audio-manager.js tests/audio-manager.test.js
git commit -m "feat(audio): AudioManager 기본 구조 및 로드 추가

- 사운드 풀링 구조 (poolSize 지원)
- masterVolume, muted 전역 상태
- load/error 이벤트"
```

---

## Task 5: AudioManager 클래스 - 재생 및 풀링

**Files:**
- Modify: `you/audio/audio-manager.js`
- Modify: `tests/audio-manager.test.js`

### Step 1: 재생 및 풀링 테스트 추가

```javascript
// tests/audio-manager.test.js에 추가

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
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/audio-manager.test.js`
Expected: FAIL - play 메서드 없음

### Step 3: play 메서드 구현

```javascript
// you/audio/audio-manager.js에 메서드 추가

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
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/audio-manager.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/audio/audio-manager.js tests/audio-manager.test.js
git commit -m "feat(audio): AudioManager play 및 풀링 로직 추가

- 사용 가능한 인스턴스 자동 선택
- 풀 가득 차면 재사용
- volume, loop 옵션 지원"
```

---

## Task 6: AudioManager 클래스 - 제어 메서드

**Files:**
- Modify: `you/audio/audio-manager.js`
- Modify: `tests/audio-manager.test.js`

### Step 1: 제어 메서드 테스트 추가

```javascript
// tests/audio-manager.test.js에 추가

  describe('pause() / resume() / stop()', () => {
    it('pause()로 특정 사운드를 일시 정지한다', async () => {
      await manager.load('bgm', 'music.mp3')
      const instance = manager.play('bgm')

      manager.pause('bgm')

      expect(instance.pause).toHaveBeenCalled()
    })

    it('resume()으로 특정 사운드를 재개한다', async () => {
      await manager.load('bgm', 'music.mp3')
      manager.play('bgm')
      manager.pause('bgm')

      manager.resume('bgm')

      expect(Audio.mock.results[0].value.play).toHaveBeenCalledTimes(2)
    })

    it('stop()으로 특정 사운드를 정지한다', async () => {
      await manager.load('bgm', 'music.mp3')
      const instance = manager.play('bgm')

      manager.stop('bgm')

      expect(instance.stop).toHaveBeenCalled()
    })

    it('stopAll()로 모든 사운드를 정지한다', async () => {
      await manager.load('bgm', 'music.mp3')
      await manager.load('sfx', 'effect.mp3')

      manager.play('bgm')
      manager.play('sfx')

      manager.stopAll()

      expect(Audio.mock.results[0].value.stop).toHaveBeenCalled()
      expect(Audio.mock.results[1].value.stop).toHaveBeenCalled()
    })
  })

  describe('mute() / unmute()', () => {
    it('mute()로 음소거한다', () => {
      manager.mute()

      expect(manager.muted).toBe(true)
    })

    it('unmute()로 음소거 해제한다', () => {
      manager.mute()
      manager.unmute()

      expect(manager.muted).toBe(false)
    })
  })

  describe('fadeIn() / fadeOut()', () => {
    it('fadeIn()으로 특정 사운드를 페이드 인한다', async () => {
      await manager.load('bgm', 'music.mp3')
      manager.play('bgm')

      manager.fadeIn('bgm', 1000)

      expect(Audio.mock.results[0].value.fadeIn).toHaveBeenCalledWith(1000)
    })

    it('fadeOut()으로 특정 사운드를 페이드 아웃한다', async () => {
      await manager.load('bgm', 'music.mp3')
      manager.play('bgm')

      manager.fadeOut('bgm', 1000)

      expect(Audio.mock.results[0].value.fadeOut).toHaveBeenCalledWith(1000)
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/audio-manager.test.js`
Expected: FAIL - pause, resume, stop 등 메서드 없음

### Step 3: 제어 메서드 구현

```javascript
// you/audio/audio-manager.js에 메서드 추가

  pause(id) {
    const pool = this._pools[id]
    if (!pool) return

    for (const audio of pool) {
      if (audio.playing) {
        audio.pause()
      }
    }
  }

  resume(id) {
    const pool = this._pools[id]
    if (!pool) return

    for (const audio of pool) {
      if (!audio.playing && audio._pauseTime > 0) {
        audio.play()
      }
    }
  }

  stop(id) {
    const pool = this._pools[id]
    if (!pool) return

    for (const audio of pool) {
      audio.stop()
    }
  }

  stopAll() {
    for (const pool of Object.values(this._pools)) {
      for (const audio of pool) {
        audio.stop()
      }
    }
  }

  fadeIn(id, duration) {
    const pool = this._pools[id]
    if (!pool) return

    for (const audio of pool) {
      if (audio.playing) {
        audio.fadeIn(duration)
      }
    }
  }

  fadeOut(id, duration) {
    const pool = this._pools[id]
    if (!pool) return

    for (const audio of pool) {
      if (audio.playing) {
        audio.fadeOut(duration)
      }
    }
  }

  mute() {
    this._muted = true
    this._updateAllVolumes()
  }

  unmute() {
    this._muted = false
    this._updateAllVolumes()
  }
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/audio-manager.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/audio/audio-manager.js tests/audio-manager.test.js
git commit -m "feat(audio): AudioManager 제어 메서드 완성

- pause/resume/stop/stopAll
- fadeIn/fadeOut
- mute/unmute"
```

---

## Task 7: 최종 검증

### Step 1: 전체 테스트 실행

Run: `pnpm test`
Expected: ALL PASS

### Step 2: 커버리지 확인

Run: `pnpm test --coverage`
Expected: audio.js, audio-manager.js 커버리지 80% 이상

### Step 3: 최종 확인

```bash
git log --oneline -10
```

---

## 파일 요약

| 파일 | 설명 |
|------|------|
| `you/audio/audio.js` | 단일 사운드 제어 (Web Audio API 래핑) |
| `you/audio/audio-manager.js` | 전역 관리 + 풀링 |
| `tests/audio.test.js` | Audio 테스트 |
| `tests/audio-manager.test.js` | AudioManager 테스트 |
