# 파티클 시스템 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 폭발, 연기, 불꽃, 비 같은 시각 효과를 위한 파티클 시스템 구현

**Architecture:** Particle이 개별 입자, ParticleEmitter가 파티클 생성/관리, ParticleSystem이 여러 이미터 통합 관리. 트위닝 시스템의 Easing 재사용

**Tech Stack:** ES6 모듈, Vitest (jsdom), Canvas API, 기존 Easing/EventEmitter 활용

**의존성:** `you/animation/easing.js` (트위닝 시스템 먼저 구현 필요)

---

## Task 1: Particle 클래스 (particle.js)

**Files:**
- Create: `you/particle/particle.js`
- Test: `tests/particle.test.js`

### Step 1: 테스트 파일 생성

```javascript
// tests/particle.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import '../you/math/vector.js'
import { Particle } from '../you/particle/particle.js'

describe('Particle', () => {
  describe('생성', () => {
    it('기본값으로 생성할 수 있다', () => {
      const particle = new Particle()

      expect(particle.position).toEqual([0, 0])
      expect(particle.velocity).toEqual([0, 0])
      expect(particle.lifetime).toBe(1)
      expect(particle.age).toBe(0)
      expect(particle.alive).toBe(true)
    })

    it('옵션으로 생성할 수 있다', () => {
      const particle = new Particle({
        position: [100, 200],
        velocity: [50, -100],
        lifetime: 2,
      })

      expect(particle.position).toEqual([100, 200])
      expect(particle.velocity).toEqual([50, -100])
      expect(particle.lifetime).toBe(2)
    })
  })

  describe('progress', () => {
    it('age / lifetime 비율을 반환한다', () => {
      const particle = new Particle({ lifetime: 2 })
      particle.age = 1

      expect(particle.progress).toBe(0.5)
    })

    it('최대 1을 반환한다', () => {
      const particle = new Particle({ lifetime: 1 })
      particle.age = 2

      expect(particle.progress).toBe(1)
    })
  })

  describe('update()', () => {
    it('속도에 따라 위치가 변한다', () => {
      const particle = new Particle({
        position: [0, 0],
        velocity: [100, 200],
        lifetime: 2,
      })

      particle.update(0.5)  // 0.5초

      expect(particle.position[0]).toBeCloseTo(50)
      expect(particle.position[1]).toBeCloseTo(100)
    })

    it('age가 증가한다', () => {
      const particle = new Particle({ lifetime: 2 })

      particle.update(0.5)

      expect(particle.age).toBe(0.5)
    })

    it('lifetime을 초과하면 alive가 false가 된다', () => {
      const particle = new Particle({ lifetime: 1 })

      particle.update(1.5)

      expect(particle.alive).toBe(false)
    })

    it('중력이 적용된다', () => {
      const particle = new Particle({
        velocity: [0, 0],
        gravity: [0, 100],
        lifetime: 2,
      })

      particle.update(1)  // 1초

      expect(particle.velocity[1]).toBeCloseTo(100)
    })

    it('마찰이 적용된다', () => {
      const particle = new Particle({
        velocity: [100, 0],
        friction: 0.5,
        lifetime: 2,
      })

      particle.update(1)

      expect(particle.velocity[0]).toBeLessThan(100)
    })
  })

  describe('reset()', () => {
    it('파티클을 초기 상태로 리셋한다', () => {
      const particle = new Particle({ lifetime: 1 })
      particle.age = 1
      particle.alive = false

      particle.reset({
        position: [50, 50],
        velocity: [10, 10],
        lifetime: 2,
      })

      expect(particle.position).toEqual([50, 50])
      expect(particle.age).toBe(0)
      expect(particle.alive).toBe(true)
    })
  })
})
```

### Step 2: 테스트 실패 확인

Run: `pnpm test tests/particle.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: Particle 클래스 구현

```javascript
// you/particle/particle.js

export class Particle {
  constructor({
    position = [0, 0],
    velocity = [0, 0],
    lifetime = 1,
    gravity = [0, 0],
    friction = 0,
    size = 8,
    alpha = 1,
    color = '#ffffff',
    rotation = 0,
    rotationSpeed = 0,
  } = {}) {
    this.position = [...position]
    this.velocity = [...velocity]
    this.lifetime = lifetime
    this.gravity = [...gravity]
    this.friction = friction

    this.size = size
    this.alpha = alpha
    this.color = color
    this.rotation = rotation
    this.rotationSpeed = rotationSpeed

    this.age = 0
    this.alive = true
  }

  get progress() {
    return Math.min(this.age / this.lifetime, 1)
  }

  update(deltaTime) {
    if (!this.alive) return

    // 중력 적용
    this.velocity[0] += this.gravity[0] * deltaTime
    this.velocity[1] += this.gravity[1] * deltaTime

    // 마찰 적용
    if (this.friction > 0) {
      const factor = 1 - this.friction * deltaTime
      this.velocity[0] *= factor
      this.velocity[1] *= factor
    }

    // 위치 업데이트
    this.position[0] += this.velocity[0] * deltaTime
    this.position[1] += this.velocity[1] * deltaTime

    // 회전 업데이트
    this.rotation += this.rotationSpeed * deltaTime

    // 나이 업데이트
    this.age += deltaTime

    // 수명 체크
    if (this.age >= this.lifetime) {
      this.alive = false
    }
  }

  reset(options = {}) {
    this.position = [...(options.position ?? [0, 0])]
    this.velocity = [...(options.velocity ?? [0, 0])]
    this.lifetime = options.lifetime ?? 1
    this.gravity = [...(options.gravity ?? [0, 0])]
    this.friction = options.friction ?? 0

    this.size = options.size ?? 8
    this.alpha = options.alpha ?? 1
    this.color = options.color ?? '#ffffff'
    this.rotation = options.rotation ?? 0
    this.rotationSpeed = options.rotationSpeed ?? 0

    this.age = 0
    this.alive = true
  }
}
```

### Step 4: 테스트 통과 확인

Run: `pnpm test tests/particle.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/particle/particle.js tests/particle.test.js
git commit -m "feat(particle): Particle 클래스 추가

- position, velocity, lifetime 기본 속성
- gravity, friction 물리 효과
- size, alpha, color, rotation 렌더링 속성
- 오브젝트 풀링을 위한 reset() 메서드"
```

---

## Task 2: 색상 보간 유틸리티

**Files:**
- Create: `you/particle/color.js`
- Test: `tests/particle-color.test.js`

### Step 1: 테스트 파일 생성

```javascript
// tests/particle-color.test.js
import { describe, it, expect } from 'vitest'
import { parseColor, lerpColor, colorToString } from '../you/particle/color.js'

describe('parseColor', () => {
  it('hex 색상을 파싱한다', () => {
    expect(parseColor('#ff0000')).toEqual([255, 0, 0, 1])
    expect(parseColor('#00ff00')).toEqual([0, 255, 0, 1])
    expect(parseColor('#0000ff')).toEqual([0, 0, 255, 1])
  })

  it('3자리 hex 색상을 파싱한다', () => {
    expect(parseColor('#f00')).toEqual([255, 0, 0, 1])
    expect(parseColor('#0f0')).toEqual([0, 255, 0, 1])
  })

  it('rgb 색상을 파싱한다', () => {
    expect(parseColor('rgb(255, 128, 0)')).toEqual([255, 128, 0, 1])
  })

  it('rgba 색상을 파싱한다', () => {
    expect(parseColor('rgba(255, 128, 0, 0.5)')).toEqual([255, 128, 0, 0.5])
  })
})

describe('lerpColor', () => {
  it('두 색상을 선형 보간한다', () => {
    const from = [255, 0, 0, 1]
    const to = [0, 255, 0, 1]

    const result = lerpColor(from, to, 0.5)

    expect(result[0]).toBeCloseTo(127.5)
    expect(result[1]).toBeCloseTo(127.5)
    expect(result[2]).toBe(0)
    expect(result[3]).toBe(1)
  })

  it('t=0이면 from 색상을 반환한다', () => {
    const from = [255, 0, 0, 1]
    const to = [0, 255, 0, 1]

    const result = lerpColor(from, to, 0)

    expect(result).toEqual(from)
  })

  it('t=1이면 to 색상을 반환한다', () => {
    const from = [255, 0, 0, 1]
    const to = [0, 255, 0, 1]

    const result = lerpColor(from, to, 1)

    expect(result).toEqual(to)
  })
})

describe('colorToString', () => {
  it('RGBA 배열을 문자열로 변환한다', () => {
    expect(colorToString([255, 0, 0, 1])).toBe('rgba(255, 0, 0, 1)')
    expect(colorToString([128, 64, 32, 0.5])).toBe('rgba(128, 64, 32, 0.5)')
  })
})
```

### Step 2: 테스트 실패 확인

Run: `pnpm test tests/particle-color.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: 색상 유틸리티 구현

```javascript
// you/particle/color.js

export function parseColor(color) {
  // hex 6자리
  if (color.match(/^#[0-9a-fA-F]{6}$/)) {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
      1,
    ]
  }

  // hex 3자리
  if (color.match(/^#[0-9a-fA-F]{3}$/)) {
    return [
      parseInt(color[1] + color[1], 16),
      parseInt(color[2] + color[2], 16),
      parseInt(color[3] + color[3], 16),
      1,
    ]
  }

  // rgb
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3]),
      1,
    ]
  }

  // rgba
  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      parseFloat(rgbaMatch[4]),
    ]
  }

  // 기본값
  return [255, 255, 255, 1]
}

export function lerpColor(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
    from[3] + (to[3] - from[3]) * t,
  ]
}

export function colorToString(rgba) {
  return `rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]})`
}
```

### Step 4: 테스트 통과 확인

Run: `pnpm test tests/particle-color.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/particle/color.js tests/particle-color.test.js
git commit -m "feat(particle): 색상 보간 유틸리티 추가

- parseColor: hex, rgb, rgba 파싱
- lerpColor: RGB 채널별 선형 보간
- colorToString: rgba 문자열 변환"
```

---

## Task 3: ParticleEmitter 클래스 (emitter.js)

**Files:**
- Create: `you/particle/emitter.js`
- Test: `tests/emitter.test.js`

### Step 1: 테스트 파일 생성

```javascript
// tests/emitter.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../you/math/vector.js'
import { ParticleEmitter } from '../you/particle/emitter.js'

describe('ParticleEmitter', () => {
  describe('생성', () => {
    it('기본값으로 생성할 수 있다', () => {
      const emitter = new ParticleEmitter()

      expect(emitter.position).toEqual([0, 0])
      expect(emitter.rate).toBe(10)
      expect(emitter.maxParticles).toBe(100)
      expect(emitter.running).toBe(false)
    })

    it('옵션으로 생성할 수 있다', () => {
      const emitter = new ParticleEmitter({
        position: [100, 200],
        rate: 20,
        maxParticles: 50,
      })

      expect(emitter.position).toEqual([100, 200])
      expect(emitter.rate).toBe(20)
      expect(emitter.maxParticles).toBe(50)
    })
  })

  describe('start() / stop()', () => {
    it('start()로 연속 생성을 시작한다', () => {
      const emitter = new ParticleEmitter()

      emitter.start()

      expect(emitter.running).toBe(true)
    })

    it('stop()으로 생성을 중지한다', () => {
      const emitter = new ParticleEmitter()

      emitter.start()
      emitter.stop()

      expect(emitter.running).toBe(false)
    })

    it('start 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter()
      const handler = vi.fn()
      emitter.event.on('start', handler)

      emitter.start()

      expect(handler).toHaveBeenCalled()
    })

    it('stop 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter()
      const handler = vi.fn()
      emitter.event.on('stop', handler)

      emitter.start()
      emitter.stop()

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('burst()', () => {
    it('한 번에 여러 파티클을 생성한다', () => {
      const emitter = new ParticleEmitter({ maxParticles: 100 })

      emitter.burst(10)

      expect(emitter.particleCount).toBe(10)
    })

    it('maxParticles를 초과하지 않는다', () => {
      const emitter = new ParticleEmitter({ maxParticles: 5 })

      emitter.burst(10)

      expect(emitter.particleCount).toBe(5)
    })
  })

  describe('update()', () => {
    it('rate에 따라 파티클이 생성된다', () => {
      const emitter = new ParticleEmitter({
        rate: 10,  // 초당 10개
        maxParticles: 100,
      })

      emitter.start()
      emitter.update(1)  // 1초

      expect(emitter.particleCount).toBeGreaterThanOrEqual(10)
    })

    it('파티클이 업데이트된다', () => {
      const emitter = new ParticleEmitter({
        lifetime: [1, 1],
        speed: [100, 100],
        direction: [0, 0],  // 오른쪽
      })

      emitter.burst(1)
      const initialX = emitter._particles[0].position[0]

      emitter.update(0.5)

      expect(emitter._particles[0].position[0]).toBeGreaterThan(initialX)
    })

    it('죽은 파티클은 제거된다 (풀로 반환)', () => {
      const emitter = new ParticleEmitter({
        lifetime: [0.1, 0.1],
        maxParticles: 10,
      })

      emitter.burst(5)
      expect(emitter.particleCount).toBe(5)

      emitter.update(0.2)  // 수명 초과

      expect(emitter.particleCount).toBe(0)
    })

    it('particleDeath 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter({
        lifetime: [0.1, 0.1],
      })
      const handler = vi.fn()
      emitter.event.on('particleDeath', handler)

      emitter.burst(1)
      emitter.update(0.2)

      expect(handler).toHaveBeenCalled()
    })

    it('모든 파티클 소멸 시 empty 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter({
        lifetime: [0.1, 0.1],
      })
      const handler = vi.fn()
      emitter.event.on('empty', handler)

      emitter.burst(1)
      emitter.update(0.2)

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('duration', () => {
    it('duration 후에 자동으로 stop된다', () => {
      const emitter = new ParticleEmitter({
        duration: 1,
        rate: 10,
      })

      emitter.start()
      emitter.update(1.5)  // duration 초과

      expect(emitter.running).toBe(false)
    })

    it('duration 끝 + empty 시 complete 이벤트가 발생한다', () => {
      const emitter = new ParticleEmitter({
        duration: 0.5,
        lifetime: [0.1, 0.1],
        rate: 10,
      })
      const handler = vi.fn()
      emitter.event.on('complete', handler)

      emitter.start()
      emitter.update(1)  // duration 초과 + 파티클 소멸

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('clear() / reset()', () => {
    it('clear()로 모든 파티클을 즉시 제거한다', () => {
      const emitter = new ParticleEmitter()

      emitter.burst(10)
      emitter.clear()

      expect(emitter.particleCount).toBe(0)
    })

    it('reset()으로 이미터를 초기화한다', () => {
      const emitter = new ParticleEmitter({ duration: 1 })

      emitter.start()
      emitter.update(0.5)
      emitter.burst(10)
      emitter.reset()

      expect(emitter.particleCount).toBe(0)
      expect(emitter.running).toBe(false)
    })
  })

  describe('시간에 따른 변화', () => {
    it('size가 변화한다', () => {
      const emitter = new ParticleEmitter({
        lifetime: [1, 1],
        size: { from: 10, to: 0 },
      })

      emitter.burst(1)
      emitter.update(0.5)  // 50% 진행

      // 내부 파티클의 size는 interpolate로 계산됨
      expect(emitter._particles[0].size).toBeCloseTo(5, 0)
    })

    it('alpha가 변화한다', () => {
      const emitter = new ParticleEmitter({
        lifetime: [1, 1],
        alpha: { from: 1, to: 0 },
      })

      emitter.burst(1)
      emitter.update(0.5)

      expect(emitter._particles[0].alpha).toBeCloseTo(0.5, 1)
    })
  })

  describe('setPosition()', () => {
    it('이미터 위치를 변경한다', () => {
      const emitter = new ParticleEmitter({ position: [0, 0] })

      emitter.setPosition(100, 200)

      expect(emitter.position).toEqual([100, 200])
    })
  })
})
```

### Step 2: 테스트 실패 확인

Run: `pnpm test tests/emitter.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: ParticleEmitter 클래스 구현

```javascript
// you/particle/emitter.js
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
    this._elapsed = 0
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

  _randomRange(range) {
    return range[0] + Math.random() * (range[1] - range[0])
  }

  _interpolate(transition, progress) {
    const t = transition.easing ? transition.easing(progress) : progress
    return transition.from + (transition.to - transition.from) * t
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
    // 모든 파티클을 풀로 반환
    for (const particle of this._particles) {
      this._pool.push(particle)
    }
    this._particles = []
  }

  reset() {
    this.clear()
    this._running = false
    this._elapsed = 0
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

      // complete 이벤트 (duration 끝 + empty)
      if (this._durationEnded) {
        this.event.emit('complete')
      }
    }
  }

  _spawnParticle() {
    // 풀에서 가져오거나 새로 생성
    let particle = this._pool.pop()
    if (!particle) {
      particle = new Particle()
    }

    // 위치 (spread 적용)
    const spawnX = this.position[0] + (Math.random() - 0.5) * 2 * this._spread
    const spawnY = this.position[1] + (Math.random() - 0.5) * 2 * this._spread

    // 속도 계산
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

  render(context) {
    context.save()
    context.globalCompositeOperation = this.blendMode

    for (const particle of this._particles) {
      this._renderParticle(context, particle)
    }

    context.restore()
  }

  _renderParticle(context, particle) {
    const { position, size, alpha, color, rotation } = particle

    context.save()
    context.globalAlpha = alpha
    context.translate(position[0], position[1])
    context.rotate(rotation)

    if (this.shape === 'circle') {
      context.beginPath()
      context.arc(0, 0, size / 2, 0, Math.PI * 2)
      context.fillStyle = color
      context.fill()
    } else if (this.shape === 'rect') {
      context.fillStyle = color
      context.fillRect(-size / 2, -size / 2, size, size)
    } else if (this.shape === 'image' && this.image) {
      const scale = this._interpolate(this._scale, particle.progress)
      const imgSize = size * scale
      if (this.image.render) {
        this.image.render(context, -imgSize / 2, -imgSize / 2, imgSize, imgSize)
      } else if (this.image.loaded !== false) {
        context.drawImage(this.image, -imgSize / 2, -imgSize / 2, imgSize, imgSize)
      }
    }

    context.restore()
  }
}
```

### Step 4: 테스트 통과 확인

Run: `pnpm test tests/emitter.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/particle/emitter.js tests/emitter.test.js
git commit -m "feat(particle): ParticleEmitter 클래스 추가

- rate 기반 연속 생성, burst 일괄 생성
- 오브젝트 풀링으로 GC 최소화
- 시간에 따른 size, alpha, color 변화 (이징 지원)
- circle, rect, image 렌더링
- start/stop/particleSpawn/particleDeath/empty/complete 이벤트"
```

---

## Task 4: ParticleSystem 클래스 (particle-system.js)

**Files:**
- Create: `you/particle/particle-system.js`
- Test: `tests/particle-system.test.js`

### Step 1: 테스트 파일 생성

```javascript
// tests/particle-system.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../you/math/vector.js'
import { ParticleSystem } from '../you/particle/particle-system.js'
import { ParticleEmitter } from '../you/particle/emitter.js'

describe('ParticleSystem', () => {
  describe('add() / remove()', () => {
    it('이미터를 추가할 수 있다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()

      system.add('explosion', emitter)

      expect(system.get('explosion')).toBe(emitter)
    })

    it('이미터를 제거할 수 있다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()

      system.add('explosion', emitter)
      system.remove('explosion')

      expect(system.get('explosion')).toBeUndefined()
    })
  })

  describe('play()', () => {
    it('특정 위치에서 이미터를 재생한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter({ rate: 0 })  // burst만 사용

      system.add('explosion', emitter)
      system.play('explosion', [100, 200])

      expect(emitter.position).toEqual([100, 200])
    })

    it('burst 옵션으로 파티클을 생성한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter({ rate: 0, maxParticles: 100 })

      system.add('explosion', emitter)
      system.play('explosion', [0, 0], { burst: 50 })

      expect(emitter.particleCount).toBe(50)
    })
  })

  describe('stop()', () => {
    it('특정 이미터를 정지한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()

      system.add('smoke', emitter)
      system.play('smoke')
      system.stop('smoke')

      expect(emitter.running).toBe(false)
    })
  })

  describe('stopAll()', () => {
    it('모든 이미터를 정지한다', () => {
      const system = new ParticleSystem()
      const emitter1 = new ParticleEmitter()
      const emitter2 = new ParticleEmitter()

      system.add('a', emitter1)
      system.add('b', emitter2)
      system.play('a')
      system.play('b')

      system.stopAll()

      expect(emitter1.running).toBe(false)
      expect(emitter2.running).toBe(false)
    })
  })

  describe('update() / render()', () => {
    it('모든 이미터를 업데이트한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()
      vi.spyOn(emitter, 'update')

      system.add('test', emitter)
      system.update(0.016)

      expect(emitter.update).toHaveBeenCalledWith(0.016)
    })

    it('모든 이미터를 렌더링한다', () => {
      const system = new ParticleSystem()
      const emitter = new ParticleEmitter()
      vi.spyOn(emitter, 'render')

      system.add('test', emitter)
      const mockContext = {}
      system.render(mockContext)

      expect(emitter.render).toHaveBeenCalledWith(mockContext)
    })
  })

  describe('totalParticleCount', () => {
    it('모든 이미터의 파티클 수를 합산한다', () => {
      const system = new ParticleSystem()
      const emitter1 = new ParticleEmitter({ maxParticles: 100 })
      const emitter2 = new ParticleEmitter({ maxParticles: 100 })

      system.add('a', emitter1)
      system.add('b', emitter2)

      emitter1.burst(10)
      emitter2.burst(20)

      expect(system.totalParticleCount).toBe(30)
    })
  })
})
```

### Step 2: 테스트 실패 확인

Run: `pnpm test tests/particle-system.test.js`
Expected: FAIL - 모듈을 찾을 수 없음

### Step 3: ParticleSystem 클래스 구현

```javascript
// you/particle/particle-system.js
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
```

### Step 4: 테스트 통과 확인

Run: `pnpm test tests/particle-system.test.js`
Expected: PASS

### Step 5: 커밋

```bash
git add you/particle/particle-system.js tests/particle-system.test.js
git commit -m "feat(particle): ParticleSystem 클래스 추가

- 여러 이미터를 이름으로 관리
- play(), stop(), stopAll() 제어
- 일괄 update/render
- totalParticleCount 속성"
```

---

## Task 5: 최종 검증

### Step 1: 전체 테스트 실행

Run: `pnpm test`
Expected: ALL PASS

### Step 2: 커버리지 확인

Run: `pnpm test --coverage`
Expected: 새 파일들 커버리지 80% 이상

### Step 3: 최종 정리

```bash
git status
git log --oneline -5
```

---

## 파일 요약

| 파일 | 설명 |
|------|------|
| `you/particle/particle.js` | 개별 파티클 |
| `you/particle/color.js` | 색상 보간 유틸리티 |
| `you/particle/emitter.js` | 파티클 이미터 |
| `you/particle/particle-system.js` | 이미터 통합 관리 |
| `tests/particle.test.js` | Particle 테스트 |
| `tests/particle-color.test.js` | 색상 유틸리티 테스트 |
| `tests/emitter.test.js` | ParticleEmitter 테스트 |
| `tests/particle-system.test.js` | ParticleSystem 테스트 |

## 사용 예시

```javascript
import { ParticleEmitter } from './you/particle/emitter.js'
import { ParticleSystem } from './you/particle/particle-system.js'
import { Easing } from './you/animation/easing.js'

// 폭발 효과
const explosion = new ParticleEmitter({
  position: [400, 300],
  rate: 0,  // burst만 사용
  maxParticles: 50,

  shape: 'circle',
  lifetime: [0.3, 0.8],
  speed: [100, 300],
  direction: [0, 360],

  size: { from: 12, to: 0, easing: Easing.easeOutQuad },
  alpha: { from: 1, to: 0, easing: Easing.easeIn },
  color: { from: '#ffff00', to: '#ff0000' },

  gravity: [0, 200],
})

// 폭발!
explosion.burst(50)

// 게임 루프
function update(deltaTime) {
  explosion.update(deltaTime / 1000)  // 초 단위
}

function render(context) {
  explosion.render(context)
}

// 여러 이펙트 관리
const effects = new ParticleSystem()
effects.add('explosion', explosion)
effects.add('smoke', new ParticleEmitter({ ... }))

effects.play('explosion', [100, 200], { burst: 50 })
effects.update(deltaTime)
effects.render(context)
```
