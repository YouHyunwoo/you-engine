# 스프라이트 애니메이션 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 스프라이트 시트에서 프레임 시퀀스를 재생하는 애니메이션 시스템 구현

**Architecture:** SpriteAnimation이 기존 Sprite의 croppingArea를 변경하며 프레임 재생, AnimatedSprite가 여러 SpriteAnimation을 관리하여 상태별 애니메이션 전환 지원

**Tech Stack:** ES6 모듈, Vitest (jsdom), 기존 Sprite/EventEmitter 활용

---

## Task 1: SpriteAnimation 클래스 - 기본 구조

**Files:**
- Create: `you/graphics/sprite-animation.js`
- Create: `tests/sprite-animation.test.js`

### Step 1: 테스트 파일 생성 - 생성자 테스트

```javascript
// tests/sprite-animation.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpriteAnimation } from '../you/graphics/sprite-animation.js'

// Mock Sprite
const createMockSprite = (width = 128, height = 64) => ({
  sheet: { width, height, loaded: true },
  croppingArea: null,
  render: vi.fn(),
})

describe('SpriteAnimation', () => {
  let sprite

  beforeEach(() => {
    sprite = createMockSprite()
  })

  describe('생성자', () => {
    it('frames 배열로 생성할 수 있다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [
          [0, 0, 32, 32],
          [32, 0, 32, 32],
        ],
      })

      expect(animation.frameCount).toBe(2)
      expect(animation.currentFrame).toBe(0)
      expect(animation.playing).toBe(false)
    })

    it('grid 옵션으로 생성할 수 있다', () => {
      const animation = new SpriteAnimation({
        sprite,
        grid: { cols: 4, start: 0, count: 4 },
      })

      expect(animation.frameCount).toBe(4)
      expect(animation.frames[0]).toEqual([0, 0, 32, 32])
      expect(animation.frames[1]).toEqual([32, 0, 32, 32])
    })

    it('grid에서 rows 지정시 frameHeight를 자동 계산한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        grid: { cols: 4, rows: 2, start: 0, count: 4 },
      })

      // 128/4=32, 64/2=32
      expect(animation.frames[0]).toEqual([0, 0, 32, 32])
    })

    it('grid의 start가 다음 행이면 y 좌표가 변한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        grid: { cols: 4, start: 4, count: 2 },
      })

      // start=4는 두 번째 행 (index 4 = col 0, row 1)
      expect(animation.frames[0]).toEqual([0, 32, 32, 32])
      expect(animation.frames[1]).toEqual([32, 32, 32, 32])
    })

    it('fps 기본값은 12이다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      expect(animation.fps).toBe(12)
    })

    it('loop 기본값은 true이다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      expect(animation.loop).toBe(true)
    })

    it('sprite가 없으면 에러를 던진다', () => {
      expect(() => new SpriteAnimation({ frames: [[0, 0, 32, 32]] }))
        .toThrow()
    })

    it('frames와 grid 둘 다 없으면 에러를 던진다', () => {
      expect(() => new SpriteAnimation({ sprite }))
        .toThrow()
    })
  })
})
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: 기본 구조 구현

```javascript
// you/graphics/sprite-animation.js
import { EventEmitter } from '../utilities/event.js'

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
}
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/sprite-animation.js tests/sprite-animation.test.js
git commit -m "feat(graphics): SpriteAnimation 기본 구조 추가

- frames 배열 또는 grid 옵션으로 프레임 정의
- grid에서 frameWidth/frameHeight 자동 계산
- EventEmitter 연결"
```

---

## Task 2: SpriteAnimation 클래스 - 재생 제어

**Files:**
- Modify: `you/graphics/sprite-animation.js`
- Modify: `tests/sprite-animation.test.js`

### Step 1: 재생 제어 테스트 추가

```javascript
// tests/sprite-animation.test.js에 추가

  describe('재생 제어', () => {
    it('play()로 재생을 시작한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      animation.play()

      expect(animation.playing).toBe(true)
    })

    it('pause()로 일시 정지한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32]],
      })

      animation.play()
      animation.pause()

      expect(animation.playing).toBe(false)
    })

    it('stop()으로 정지하고 처음으로 돌아간다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
      })

      animation.play()
      animation._currentFrame = 1
      animation.stop()

      expect(animation.playing).toBe(false)
      expect(animation.currentFrame).toBe(0)
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: FAIL - play, pause, stop 메서드 없음

### Step 3: 재생 제어 메서드 구현

```javascript
// you/graphics/sprite-animation.js에 메서드 추가

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
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/sprite-animation.js tests/sprite-animation.test.js
git commit -m "feat(graphics): SpriteAnimation 재생 제어 메서드 추가

- play(): 재생 시작
- pause(): 일시 정지
- stop(): 정지 및 처음으로"
```

---

## Task 3: SpriteAnimation 클래스 - update 및 프레임 진행

**Files:**
- Modify: `you/graphics/sprite-animation.js`
- Modify: `tests/sprite-animation.test.js`

### Step 1: update 테스트 추가

```javascript
// tests/sprite-animation.test.js에 추가

  describe('update()', () => {
    it('fps에 따라 프레임이 진행된다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [
          [0, 0, 32, 32],
          [32, 0, 32, 32],
          [64, 0, 32, 32],
        ],
        fps: 10,  // 100ms per frame
      })

      animation.play()
      expect(animation.currentFrame).toBe(0)

      animation.update(100)  // 100ms 경과
      expect(animation.currentFrame).toBe(1)

      animation.update(100)  // 200ms 경과
      expect(animation.currentFrame).toBe(2)
    })

    it('재생 중이 아니면 프레임이 진행되지 않는다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
      })

      animation.update(100)

      expect(animation.currentFrame).toBe(0)
    })

    it('loop=true면 마지막 프레임 후 처음으로 돌아간다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: true,
      })

      animation.play()
      animation.update(100)  // frame 1
      animation.update(100)  // frame 0 (loop)

      expect(animation.currentFrame).toBe(0)
    })

    it('loop=false면 마지막 프레임에서 멈춘다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: false,
      })

      animation.play()
      animation.update(100)  // frame 1
      animation.update(100)  // 끝

      expect(animation.currentFrame).toBe(1)
      expect(animation.playing).toBe(false)
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: FAIL - update 메서드 없음

### Step 3: update 메서드 구현

```javascript
// you/graphics/sprite-animation.js에 메서드 추가

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
        this.event.emit('loop')
      } else {
        this._playing = false
        this.event.emit('finish')
      }
    } else {
      this._currentFrame = nextFrame
    }

    this.event.emit('frame', this._currentFrame)
  }
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/sprite-animation.js tests/sprite-animation.test.js
git commit -m "feat(graphics): SpriteAnimation update 메서드 추가

- fps 기반 프레임 진행
- loop 지원
- frame/loop/finish 이벤트 발생"
```

---

## Task 4: SpriteAnimation 클래스 - 이벤트 및 render

**Files:**
- Modify: `you/graphics/sprite-animation.js`
- Modify: `tests/sprite-animation.test.js`

### Step 1: 이벤트 및 render 테스트 추가

```javascript
// tests/sprite-animation.test.js에 추가

  describe('이벤트', () => {
    it('프레임 변경시 frame 이벤트가 발생한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
      })
      const frameHandler = vi.fn()
      animation.event.on('frame', frameHandler)

      animation.play()
      animation.update(100)

      expect(frameHandler).toHaveBeenCalledWith(1)
    })

    it('루프 완료시 loop 이벤트가 발생한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: true,
      })
      const loopHandler = vi.fn()
      animation.event.on('loop', loopHandler)

      animation.play()
      animation.update(100)  // frame 1
      animation.update(100)  // loop to frame 0

      expect(loopHandler).toHaveBeenCalled()
    })

    it('loop=false 완료시 finish 이벤트가 발생한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [[0, 0, 32, 32], [32, 0, 32, 32]],
        fps: 10,
        loop: false,
      })
      const finishHandler = vi.fn()
      animation.event.on('finish', finishHandler)

      animation.play()
      animation.update(100)  // frame 1
      animation.update(100)  // finish

      expect(finishHandler).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('현재 프레임 영역으로 sprite.croppingArea를 설정하고 렌더링한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [
          [0, 0, 32, 32],
          [32, 0, 32, 32],
        ],
      })
      const mockContext = {}

      animation.render(mockContext, 100, 200)

      expect(sprite.croppingArea).toEqual([0, 0, 32, 32])
      expect(sprite.render).toHaveBeenCalledWith(mockContext, 100, 200)
    })

    it('프레임 진행 후 올바른 영역을 사용한다', () => {
      const animation = new SpriteAnimation({
        sprite,
        frames: [
          [0, 0, 32, 32],
          [32, 0, 32, 32],
        ],
        fps: 10,
      })
      const mockContext = {}

      animation.play()
      animation.update(100)
      animation.render(mockContext, 0, 0)

      expect(sprite.croppingArea).toEqual([32, 0, 32, 32])
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: FAIL - render 메서드 없음

### Step 3: render 메서드 구현

```javascript
// you/graphics/sprite-animation.js에 메서드 추가

  render(context, x = 0, y = 0) {
    this.sprite.croppingArea = this.frames[this._currentFrame]
    this.sprite.render(context, x, y)
  }
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/sprite-animation.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/sprite-animation.js tests/sprite-animation.test.js
git commit -m "feat(graphics): SpriteAnimation render 및 이벤트 완성

- render(): sprite.croppingArea 설정 후 렌더링
- frame/loop/finish 이벤트 테스트 추가"
```

---

## Task 5: AnimatedSprite 클래스 - 기본 구조

**Files:**
- Create: `you/graphics/animated-sprite.js`
- Create: `tests/animated-sprite.test.js`

### Step 1: 테스트 파일 생성

```javascript
// tests/animated-sprite.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnimatedSprite } from '../you/graphics/animated-sprite.js'

// Mock Image (sheet)
const createMockSheet = (width = 128, height = 64) => ({
  width,
  height,
  loaded: true,
  render: vi.fn(),
})

describe('AnimatedSprite', () => {
  let sheet

  beforeEach(() => {
    sheet = createMockSheet()
  })

  describe('생성자', () => {
    it('여러 애니메이션으로 생성할 수 있다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
          walk: { grid: { cols: 4, start: 4, count: 4 }, fps: 12 },
        },
      })

      expect(sprite).toBeDefined()
    })

    it('default 애니메이션을 설정할 수 있다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
        },
        default: 'idle',
      })

      expect(sprite.current).toBe('idle')
    })

    it('scale과 anchor를 설정할 수 있다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        scale: [2, 2],
        anchor: [0.5, 0.5],
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
        },
      })

      expect(sprite.scale).toEqual([2, 2])
      expect(sprite.anchor).toEqual([0.5, 0.5])
    })

    it('sheet가 없으면 에러를 던진다', () => {
      expect(() => new AnimatedSprite({
        animations: { idle: { grid: { cols: 4, start: 0, count: 4 } } },
      })).toThrow()
    })

    it('animations가 없으면 에러를 던진다', () => {
      expect(() => new AnimatedSprite({ sheet })).toThrow()
    })
  })
})
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/animated-sprite.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: 기본 구조 구현

```javascript
// you/graphics/animated-sprite.js
import { Sprite } from './sprite.js'
import { SpriteAnimation } from './sprite-animation.js'
import { EventEmitter } from '../utilities/event.js'

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
      animation.event.on('frame', (frameIndex) => {
        this.event.emit('frame', frameIndex)
      })

      animation.event.on('finish', () => {
        this.event.emit('finish', name)
      })

      animation.event.on('loop', () => {
        this.event.emit('loop', name)
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

  get currentFrame() {
    return this._currentAnimation?.currentFrame ?? 0
  }

  get playing() {
    return this._currentAnimation?.playing ?? false
  }

  _setCurrent(name) {
    if (!this._animations[name]) {
      throw new Error(`Animation '${name}' not found`)
    }

    this._currentAnimation?.stop()
    this._current = name
    this._currentAnimation = this._animations[name]
  }
}
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/animated-sprite.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/animated-sprite.js tests/animated-sprite.test.js
git commit -m "feat(graphics): AnimatedSprite 기본 구조 추가

- 여러 애니메이션 정의 지원
- 내부 Sprite + SpriteAnimation 조합
- 이벤트 위임 (frame/finish/loop)"
```

---

## Task 6: AnimatedSprite 클래스 - 재생 제어

**Files:**
- Modify: `you/graphics/animated-sprite.js`
- Modify: `tests/animated-sprite.test.js`

### Step 1: 재생 제어 테스트 추가

```javascript
// tests/animated-sprite.test.js에 추가

  describe('play()', () => {
    it('특정 애니메이션을 재생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
          walk: { grid: { cols: 4, start: 4, count: 4 }, fps: 12 },
        },
        default: 'idle',
      })

      sprite.play('walk')

      expect(sprite.current).toBe('walk')
      expect(sprite.playing).toBe(true)
    })

    it('같은 애니메이션을 다시 호출해도 리셋되지 않는다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 2 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.update(100)  // frame 1
      sprite.play('idle')

      expect(sprite.currentFrame).toBe(1)
    })

    it('다른 애니메이션으로 변경하면 처음부터 시작한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 2 }, fps: 10 },
          walk: { grid: { cols: 4, start: 4, count: 2 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.update(100)  // frame 1
      sprite.play('walk')

      expect(sprite.currentFrame).toBe(0)
    })

    it('존재하지 않는 애니메이션을 재생하면 에러를 던진다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
        },
      })

      expect(() => sprite.play('nonexistent')).toThrow()
    })
  })

  describe('pause() / stop()', () => {
    it('pause()로 일시 정지한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.pause()

      expect(sprite.playing).toBe(false)
    })

    it('stop()으로 정지하고 처음으로 돌아간다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      sprite.update(100)
      sprite.stop()

      expect(sprite.playing).toBe(false)
      expect(sprite.currentFrame).toBe(0)
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/animated-sprite.test.js`
Expected: FAIL - play, pause, stop 메서드 없음

### Step 3: 재생 제어 메서드 구현

```javascript
// you/graphics/animated-sprite.js에 메서드 추가

  play(name) {
    if (name === this._current) {
      this._currentAnimation?.play()
      return
    }

    this._setCurrent(name)
    this._currentAnimation?.play()
    this.event.emit('change', name)
  }

  pause() {
    this._currentAnimation?.pause()
  }

  stop() {
    this._currentAnimation?.stop()
  }
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/animated-sprite.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/animated-sprite.js tests/animated-sprite.test.js
git commit -m "feat(graphics): AnimatedSprite 재생 제어 메서드 추가

- play(name): 애니메이션 전환, 같은 애니메이션은 리셋 안함
- pause(): 일시 정지
- stop(): 정지 및 처음으로
- change 이벤트 발생"
```

---

## Task 7: AnimatedSprite 클래스 - update/render 및 이벤트

**Files:**
- Modify: `you/graphics/animated-sprite.js`
- Modify: `tests/animated-sprite.test.js`

### Step 1: update/render 및 이벤트 테스트 추가

```javascript
// tests/animated-sprite.test.js에 추가

  describe('update() / render()', () => {
    it('update()로 프레임이 진행된다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 10 },
        },
        default: 'idle',
      })

      sprite.play('idle')
      expect(sprite.currentFrame).toBe(0)

      sprite.update(100)

      expect(sprite.currentFrame).toBe(1)
    })

    it('render()로 현재 프레임을 렌더링한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
        },
        default: 'idle',
      })
      const mockContext = {}

      sprite.render(mockContext, 100, 200)

      expect(sheet.render).toHaveBeenCalled()
    })
  })

  describe('이벤트', () => {
    it('애니메이션 변경시 change 이벤트가 발생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
          walk: { grid: { cols: 4, start: 4, count: 4 }, fps: 12 },
        },
        default: 'idle',
      })
      const changeHandler = vi.fn()
      sprite.event.on('change', changeHandler)

      sprite.play('walk')

      expect(changeHandler).toHaveBeenCalledWith('walk')
    })

    it('프레임 변경시 frame 이벤트가 발생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 10 },
        },
        default: 'idle',
      })
      const frameHandler = vi.fn()
      sprite.event.on('frame', frameHandler)

      sprite.play('idle')
      sprite.update(100)

      expect(frameHandler).toHaveBeenCalledWith(1)
    })

    it('loop=false 완료시 finish 이벤트가 발생한다', () => {
      const sprite = new AnimatedSprite({
        sheet,
        animations: {
          jump: { grid: { cols: 4, start: 0, count: 2 }, fps: 10, loop: false },
        },
      })
      const finishHandler = vi.fn()
      sprite.event.on('finish', finishHandler)

      sprite.play('jump')
      sprite.update(100)  // frame 1
      sprite.update(100)  // finish

      expect(finishHandler).toHaveBeenCalledWith('jump')
    })
  })
```

### Step 2: 테스트 실행하여 실패 확인

Run: `pnpm test tests/animated-sprite.test.js`
Expected: FAIL - update, render 메서드 없음

### Step 3: update/render 메서드 구현

```javascript
// you/graphics/animated-sprite.js에 메서드 추가

  update(deltaTime) {
    this._currentAnimation?.update(deltaTime)
  }

  render(context, x = 0, y = 0) {
    this._currentAnimation?.render(context, x, y)
  }
```

### Step 4: 테스트 실행하여 통과 확인

Run: `pnpm test tests/animated-sprite.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/graphics/animated-sprite.js tests/animated-sprite.test.js
git commit -m "feat(graphics): AnimatedSprite update/render 및 이벤트 완성

- update(): 현재 애니메이션 업데이트
- render(): 현재 프레임 렌더링
- change/frame/finish 이벤트 테스트"
```

---

## Task 8: 최종 검증 및 정리

### Step 1: 전체 테스트 실행

Run: `pnpm test`
Expected: ALL PASS

### Step 2: 커버리지 확인

Run: `pnpm test --coverage`
Expected: sprite-animation.js, animated-sprite.js 커버리지 80% 이상

### Step 3: 최종 확인

```bash
git log --oneline -10
```

---

## 파일 요약

| 파일 | 설명 |
|------|------|
| `you/graphics/sprite-animation.js` | 단일 애니메이션 재생 |
| `you/graphics/animated-sprite.js` | 여러 애니메이션 통합 관리 |
| `tests/sprite-animation.test.js` | SpriteAnimation 테스트 |
| `tests/animated-sprite.test.js` | AnimatedSprite 테스트 |
