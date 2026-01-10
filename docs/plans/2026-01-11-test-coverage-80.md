# 테스트 커버리지 80% 달성 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 현재 9.41%인 테스트 커버리지를 80%까지 올린다.

**Architecture:** 단위 테스트 중심으로, 각 모듈의 공개 API를 테스트한다. jsdom 환경에서 브라우저 API를 모킹하여 테스트한다. 의존성이 적은 모듈부터 시작하여 점진적으로 커버리지를 올린다.

**Tech Stack:** Vitest, jsdom, vi.fn() (mock)

---

## 현재 상태

| 파일 | 현재 커버리지 | 목표 |
|------|--------------|------|
| `utilities/event.js` | 80.95% | 유지 |
| `utilities/procedure.js` | 50% | 80%+ |
| `math/geometry.js` | 51.92% | 80%+ |
| `framework/output.js` | 36.36% | 80%+ |
| `application.js` | 22.72% | 80%+ |
| `math/vector.js` | 0% | 80%+ |
| `framework/object.js` | 6.66% | 80%+ |
| `object.js` | 0% | 80%+ |
| `component.js` | 0% | 80%+ |
| `scene.js` | 0% | 80%+ |
| `camera.js` | 0% | 80%+ |
| `asset.js` | 0% | 80%+ |
| `framework/screen.js` | 0% | 80%+ |
| `screen.js` | 0% | 80%+ |
| `math/random.js` | 0% | 80%+ |
| 기타 (engine, resource 등) | 0% | 제외 (통합 테스트 필요) |

## 우선순위

1. **기초 모듈** (의존성 없음): vector, geometry, random, asset, screen
2. **프레임워크 객체**: framework/object, component
3. **게임 객체**: object, scene, camera
4. **애플리케이션**: application (추가 테스트)
5. **유틸리티**: procedure (추가 테스트), event (유지)

---

## Task 1: math/vector.js 테스트 (113줄, 0% → 80%+)

**Files:**
- Create: `tests/vector.test.js`
- Test: `you/math/vector.js`

**Step 1: 테스트 파일 생성 - Array 기본 연산**

```javascript
import { describe, it, expect, beforeAll } from 'vitest'
import '../you/math/vector.js'

describe('Array Vector Operations', () => {
  describe('add()', () => {
    it('두 배열을 요소별로 더한다', () => {
      const result = [1, 2, 3].add([4, 5, 6])
      expect(result).toEqual([5, 7, 9])
    })

    it('스칼라를 모든 요소에 더한다', () => {
      const result = [1, 2, 3].add(10)
      expect(result).toEqual([11, 12, 13])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].add([1, 2, 3])).toThrow()
    })
  })

  describe('sub()', () => {
    it('두 배열을 요소별로 뺀다', () => {
      const result = [5, 7, 9].sub([1, 2, 3])
      expect(result).toEqual([4, 5, 6])
    })

    it('스칼라를 모든 요소에서 뺀다', () => {
      const result = [10, 20, 30].sub(5)
      expect(result).toEqual([5, 15, 25])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].sub([1, 2, 3])).toThrow()
    })
  })

  describe('mul()', () => {
    it('두 배열을 요소별로 곱한다', () => {
      const result = [2, 3, 4].mul([5, 6, 7])
      expect(result).toEqual([10, 18, 28])
    })

    it('스칼라를 모든 요소에 곱한다', () => {
      const result = [1, 2, 3].mul(2)
      expect(result).toEqual([2, 4, 6])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].mul([1, 2, 3])).toThrow()
    })
  })

  describe('div()', () => {
    it('두 배열을 요소별로 나눈다', () => {
      const result = [10, 20, 30].div([2, 4, 5])
      expect(result).toEqual([5, 5, 6])
    })

    it('스칼라로 모든 요소를 나눈다', () => {
      const result = [10, 20, 30].div(10)
      expect(result).toEqual([1, 2, 3])
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].div([1, 2, 3])).toThrow()
    })
  })

  describe('equals()', () => {
    it('같은 배열이면 true를 반환한다', () => {
      expect([1, 2, 3].equals([1, 2, 3])).toBe(true)
    })

    it('다른 배열이면 false를 반환한다', () => {
      expect([1, 2, 3].equals([1, 2, 4])).toBe(false)
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].equals([1, 2, 3])).toThrow()
    })
  })

  describe('dot()', () => {
    it('내적을 계산한다', () => {
      const result = [1, 2, 3].dot([4, 5, 6])
      expect(result).toBe(32) // 1*4 + 2*5 + 3*6 = 32
    })

    it('길이가 다르면 에러를 던진다', () => {
      expect(() => [1, 2].dot([1, 2, 3])).toThrow()
    })
  })

  describe('negate', () => {
    it('모든 요소의 부호를 반전한다', () => {
      expect([1, -2, 3].negate).toEqual([-1, 2, -3])
    })
  })

  describe('magnitude', () => {
    it('벡터의 크기를 계산한다', () => {
      expect([3, 4].magnitude).toBe(5)
    })
  })

  describe('normalize()', () => {
    it('단위 벡터로 정규화한다', () => {
      const result = [3, 4].normalize()
      expect(result[0]).toBeCloseTo(0.6)
      expect(result[1]).toBeCloseTo(0.8)
    })
  })
})

describe('Array Static Methods', () => {
  describe('Array.zeros()', () => {
    it('1차원 0 배열을 생성한다', () => {
      expect(Array.zeros(3)).toEqual([0, 0, 0])
    })

    it('2차원 0 배열을 생성한다', () => {
      expect(Array.zeros(2, 3)).toEqual([[0, 0], [0, 0], [0, 0]])
    })

    it('인자가 없으면 에러를 던진다', () => {
      expect(() => Array.zeros()).toThrow()
    })
  })

  describe('Array.repeat()', () => {
    it('값을 반복한 배열을 생성한다', () => {
      expect(Array.repeat(3, 5)).toEqual([5, 5, 5])
    })

    it('함수를 반복 호출한 배열을 생성한다', () => {
      let counter = 0
      const result = Array.repeat(3, () => ++counter)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('Array.range()', () => {
    it('start부터 end까지 범위를 생성한다', () => {
      expect([...Array.range(0, 5)]).toEqual([0, 1, 2, 3, 4])
    })

    it('start 생략시 0부터 시작한다', () => {
      expect([...Array.range(3)]).toEqual([0, 1, 2])
    })

    it('step을 지정할 수 있다', () => {
      expect([...Array.range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8])
    })
  })

  describe('choice()', () => {
    it('랜덤하게 하나를 선택한다', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = arr.choice()
      expect(arr).toContain(result)
    })

    it('여러 개를 선택한다', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = arr.choice(3)
      expect(result).toHaveLength(3)
      result.forEach(item => expect(arr).toContain(item))
    })

    it('중복 없이 선택한다', () => {
      const arr = [1, 2, 3]
      const result = arr.choice(3)
      expect(new Set(result).size).toBe(3)
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/vector.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/vector.test.js
git commit -m "test: math/vector.js 테스트 추가

- Array 기본 연산 테스트 (add, sub, mul, div, equals, dot)
- 벡터 연산 테스트 (negate, magnitude, normalize)
- Array 정적 메서드 테스트 (zeros, repeat, range, choice)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: math/random.js 테스트 (13줄, 0% → 80%+)

**Files:**
- Create: `tests/random.test.js`
- Test: `you/math/random.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect } from 'vitest'
import '../you/math/vector.js'
import { Random } from '../you/math/random.js'

describe('Random', () => {
  describe('range()', () => {
    it('start와 end 사이의 값을 반환한다', () => {
      for (let i = 0; i < 100; i++) {
        const result = Random.range(10, 20)
        expect(result).toBeGreaterThanOrEqual(10)
        expect(result).toBeLessThan(20)
      }
    })
  })

  describe('repeat()', () => {
    it('지정된 개수만큼 랜덤 값 배열을 반환한다', () => {
      const result = Random.repeat(5)
      expect(result).toHaveLength(5)
      result.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      })
    })
  })

  describe('color()', () => {
    it('rgba 색상 문자열을 반환한다', () => {
      const result = Random.color()
      expect(result).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/)
    })

    it('alpha=true이면 알파값도 랜덤이다', () => {
      const result = Random.color(true)
      expect(result).toMatch(/^rgba\(\d+, \d+, \d+, [\d.]+\)$/)
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/random.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/random.test.js
git commit -m "test: math/random.js 테스트 추가

- Random.range() 범위 테스트
- Random.repeat() 배열 생성 테스트
- Random.color() 색상 문자열 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: asset.js 테스트 (25줄, 0% → 80%+)

**Files:**
- Create: `tests/asset.test.js`
- Test: `you/asset.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Asset } from '../you/asset.js'

describe('Asset', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('constructor', () => {
    it('localStorage에 데이터가 없으면 initialData로 초기화한다', () => {
      const asset = new Asset('test-id', { score: 100, level: 1 })

      expect(asset.id).toBe('test-id')
      expect(asset.score).toBe(100)
      expect(asset.level).toBe(1)
    })

    it('localStorage에 데이터가 있으면 불러온다', () => {
      localStorage.setItem('test-id', JSON.stringify({ score: 500, level: 10 }))

      const asset = new Asset('test-id', { score: 0, level: 0 })

      expect(asset.score).toBe(500)
      expect(asset.level).toBe(10)
    })

    it('initialData가 localStorage에 저장된다', () => {
      new Asset('test-id', { score: 100 })

      const stored = JSON.parse(localStorage.getItem('test-id'))
      expect(stored.score).toBe(100)
    })
  })

  describe('save()', () => {
    it('현재 상태를 localStorage에 저장한다', () => {
      const asset = new Asset('test-id', { score: 100 })
      asset.score = 999

      asset.save()

      const stored = JSON.parse(localStorage.getItem('test-id'))
      expect(stored.score).toBe(999)
    })

    it('id는 저장하지 않는다', () => {
      const asset = new Asset('test-id', { score: 100 })

      asset.save()

      const stored = JSON.parse(localStorage.getItem('test-id'))
      expect(stored.id).toBeUndefined()
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/asset.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/asset.test.js
git commit -m "test: asset.js 테스트 추가

- Asset 생성자 테스트 (초기화, localStorage 로드)
- save() 메서드 테스트 (저장, id 제외)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: framework/screen.js 테스트 (25줄, 0% → 80%+)

**Files:**
- Create: `tests/framework-screen.test.js`
- Test: `you/framework/screen.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect } from 'vitest'
import { Screen } from '../you/framework/screen.js'

describe('Screen', () => {
  describe('constructor', () => {
    it('id와 size로 초기화한다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.id).toBe('main')
      expect(screen.width).toBe(800)
      expect(screen.height).toBe(600)
    })
  })

  describe('width/height getter/setter', () => {
    it('width를 가져오고 설정한다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.width).toBe(800)
      screen.width = 1024
      expect(screen.width).toBe(1024)
    })

    it('height를 가져오고 설정한다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.height).toBe(600)
      screen.height = 768
      expect(screen.height).toBe(768)
    })
  })

  describe('size getter/setter', () => {
    it('size를 가져온다', () => {
      const screen = new Screen('main', [800, 600])

      expect(screen.size).toEqual([800, 600])
    })

    it('size를 설정한다', () => {
      const screen = new Screen('main', [800, 600])

      screen.size = [1920, 1080]

      expect(screen.width).toBe(1920)
      expect(screen.height).toBe(1080)
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/framework-screen.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/framework-screen.test.js
git commit -m "test: framework/screen.js 테스트 추가

- Screen 생성자 테스트
- width/height getter/setter 테스트
- size getter/setter 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: screen.js (CanvasScreen) 테스트 (50줄, 0% → 80%+)

**Files:**
- Create: `tests/canvas-screen.test.js`
- Test: `you/screen.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect, vi } from 'vitest'
import { CanvasScreen } from '../you/screen.js'

describe('CanvasScreen', () => {
  const createMockCanvas = () => {
    return {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({})),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  }

  describe('constructor', () => {
    it('canvas와 context를 설정한다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      expect(screen.canvas).toBe(canvas)
      expect(screen.context).toBeDefined()
      expect(canvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('canvas 크기를 설정한다', () => {
      const canvas = createMockCanvas()
      new CanvasScreen('main', [800, 600], canvas)

      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
    })
  })

  describe('width/height setter', () => {
    it('width 설정시 canvas.width도 변경된다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      screen.width = 1024

      expect(screen.width).toBe(1024)
      expect(canvas.width).toBe(1024)
    })

    it('height 설정시 canvas.height도 변경된다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      screen.height = 768

      expect(screen.height).toBe(768)
      expect(canvas.height).toBe(768)
    })
  })

  describe('size getter/setter', () => {
    it('size를 가져온다 (복사본 반환)', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      const size = screen.size
      size[0] = 9999

      expect(screen.width).toBe(800) // 원본 변경 안됨
    })

    it('size 설정시 canvas 크기도 변경된다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)

      screen.size = [1920, 1080]

      expect(canvas.width).toBe(1920)
      expect(canvas.height).toBe(1080)
    })
  })

  describe('addEventListener/removeEventListener', () => {
    it('canvas에 이벤트 리스너를 추가한다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)
      const listener = vi.fn()

      screen.addEventListener('click', listener)

      expect(canvas.addEventListener).toHaveBeenCalledWith('click', listener)
    })

    it('canvas에서 이벤트 리스너를 제거한다', () => {
      const canvas = createMockCanvas()
      const screen = new CanvasScreen('main', [800, 600], canvas)
      const listener = vi.fn()

      screen.removeEventListener('click', listener)

      expect(canvas.removeEventListener).toHaveBeenCalledWith('click', listener)
    })
  })

  describe('createOffscreen', () => {
    it('오프스크린 캔버스를 생성한다', () => {
      const screen = CanvasScreen.createOffscreen('offscreen', [400, 300])

      expect(screen).toBeInstanceOf(CanvasScreen)
      expect(screen.id).toBe('offscreen')
      expect(screen.width).toBe(400)
      expect(screen.height).toBe(300)
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/canvas-screen.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/canvas-screen.test.js
git commit -m "test: screen.js (CanvasScreen) 테스트 추가

- CanvasScreen 생성자 테스트
- width/height/size getter/setter 테스트
- addEventListener/removeEventListener 테스트
- createOffscreen 정적 메서드 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: framework/object.js 테스트 (202줄, 6.66% → 80%+)

**Files:**
- Create: `tests/framework-object.test.js`
- Test: `you/framework/object.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect, vi } from 'vitest'
import { Object, Loopable, Enable, Stateful } from '../you/framework/object.js'

describe('Object', () => {
  describe('constructor', () => {
    it('events 옵션으로 이벤트 리스너를 등록한다', () => {
      const listener = vi.fn()
      const obj = new Object({ events: { test: listener } })

      obj.event.emit('test')

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('create()', () => {
    it('willCreate, didCreate를 순서대로 호출한다', () => {
      const order = []
      const obj = new Object()
      obj.willCreate = () => order.push('willCreate')
      obj.didCreate = () => order.push('didCreate')

      obj.create()

      expect(order).toEqual(['willCreate', 'didCreate'])
    })

    it('이벤트를 발생시킨다', () => {
      const willCreateListener = vi.fn()
      const didCreateListener = vi.fn()
      const obj = new Object({
        events: { willCreate: willCreateListener, didCreate: didCreateListener }
      })

      obj.create()

      expect(willCreateListener).toHaveBeenCalled()
      expect(didCreateListener).toHaveBeenCalled()
    })
  })

  describe('destroy()', () => {
    it('willDestroy, didDestroy를 순서대로 호출한다', () => {
      const order = []
      const obj = new Object()
      obj.willDestroy = () => order.push('willDestroy')
      obj.didDestroy = () => order.push('didDestroy')

      obj.destroy()

      expect(order).toEqual(['willDestroy', 'didDestroy'])
    })
  })
})

describe('Loopable', () => {
  describe('update()', () => {
    it('willUpdate, didUpdate를 순서대로 호출한다', () => {
      const order = []
      const obj = new Loopable()
      obj.willUpdate = () => order.push('willUpdate')
      obj.didUpdate = () => order.push('didUpdate')

      obj.update(16, {}, {})

      expect(order).toEqual(['willUpdate', 'didUpdate'])
    })

    it('이벤트를 발생시킨다', () => {
      const listener = vi.fn()
      const obj = new Loopable({ events: { willUpdate: listener } })

      obj.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('willRender, didRender를 순서대로 호출한다', () => {
      const order = []
      const obj = new Loopable()
      obj.willRender = () => order.push('willRender')
      obj.didRender = () => order.push('didRender')

      obj.render({}, {}, {})

      expect(order).toEqual(['willRender', 'didRender'])
    })
  })
})

describe('Enable', () => {
  describe('constructor', () => {
    it('기본값은 enable=true이다', () => {
      const obj = new Enable()
      expect(obj.enable).toBe(true)
    })

    it('enable=false로 생성할 수 있다', () => {
      const obj = new Enable({ enable: false })
      expect(obj.enable).toBe(false)
    })
  })

  describe('enable setter', () => {
    it('true로 설정하면 willBeEnabled, didBeEnabled가 호출된다', () => {
      const order = []
      const obj = new Enable({ enable: false })
      obj.willBeEnabled = () => order.push('willBeEnabled')
      obj.didBeEnabled = () => order.push('didBeEnabled')

      obj.enable = true

      expect(order).toEqual(['willBeEnabled', 'didBeEnabled'])
    })

    it('false로 설정하면 willBeDisabled, didBeDisabled가 호출된다', () => {
      const order = []
      const obj = new Enable({ enable: true })
      obj.willBeDisabled = () => order.push('willBeDisabled')
      obj.didBeDisabled = () => order.push('didBeDisabled')

      obj.enable = false

      expect(order).toEqual(['willBeDisabled', 'didBeDisabled'])
    })
  })

  describe('update()', () => {
    it('enable=false이면 update가 실행되지 않는다', () => {
      const obj = new Enable({ enable: false })
      const listener = vi.fn()
      obj.willUpdate = listener

      obj.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('enable=false이면 render가 실행되지 않는다', () => {
      const obj = new Enable({ enable: false })
      const listener = vi.fn()
      obj.willRender = listener

      obj.render({}, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })
  })
})

describe('Stateful', () => {
  describe('constructor', () => {
    it('초기 상태는 INSTANTIATED이다', () => {
      const obj = new Stateful()
      expect(obj.created).toBe(false)
      expect(obj.destroyed).toBe(false)
    })
  })

  describe('create()', () => {
    it('INSTANTIATED 상태에서만 create가 동작한다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willCreate = listener

      obj.create()
      obj.create() // 두 번째 호출

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('create 후 created=true이다', () => {
      const obj = new Stateful()

      obj.create()

      expect(obj.created).toBe(true)
    })
  })

  describe('destroy()', () => {
    it('CREATED 상태에서만 destroy가 동작한다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willDestroy = listener

      obj.destroy() // INSTANTIATED 상태에서 호출

      expect(listener).not.toHaveBeenCalled()
    })

    it('destroy시 enable=false가 된다', () => {
      const obj = new Stateful()
      obj.create()

      obj.destroy()

      expect(obj.enable).toBe(false)
    })

    it('destroy 후 destroyed=true이다', () => {
      const obj = new Stateful()
      obj.create()

      obj.destroy()

      expect(obj.destroyed).toBe(true)
    })
  })

  describe('enable setter (Stateful)', () => {
    it('DESTROYING/DESTROYED 상태에서는 enable을 변경할 수 없다', () => {
      const obj = new Stateful()
      obj.create()
      obj.destroy()

      obj.enable = true

      expect(obj.enable).toBe(false)
    })
  })

  describe('update()', () => {
    it('CREATED 상태가 아니면 update가 실행되지 않는다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willUpdate = listener

      obj.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('CREATED + enable=true이면 update가 실행된다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willUpdate = listener
      obj.create()

      obj.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('CREATED 상태가 아니면 render가 실행되지 않는다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willRender = listener

      obj.render({}, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/framework-object.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/framework-object.test.js
git commit -m "test: framework/object.js 테스트 추가

- Object 클래스 생성/소멸 라이프사이클 테스트
- Loopable 클래스 update/render 테스트
- Enable 클래스 enable/disable 상태 테스트
- Stateful 클래스 상태 전이 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: component.js 테스트 (35줄, 0% → 80%+)

**Files:**
- Create: `tests/component.test.js`
- Test: `you/component.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect, vi } from 'vitest'
import { Component } from '../you/component.js'
import { Stateful } from '../you/framework/object.js'

describe('Component', () => {
  describe('constructor', () => {
    it('기본값은 enable=true이다', () => {
      const component = new Component()
      expect(component.enable).toBe(true)
    })

    it('object는 null로 초기화된다', () => {
      const component = new Component()
      expect(component.object).toBeNull()
    })
  })

  describe('update()', () => {
    it('enable=false이면 실행되지 않는다', () => {
      const component = new Component({ enable: false })
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('object가 없으면 실행되지 않는다', () => {
      const component = new Component()
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('object.created=false이면 실행되지 않는다', () => {
      const component = new Component()
      const mockObject = { created: false }
      component.object = mockObject
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('enable=true, object.created=true이면 실행된다', () => {
      const component = new Component()
      const mockObject = { created: true }
      component.object = mockObject
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('enable=true, object.created=true이면 실행된다', () => {
      const component = new Component()
      const mockObject = { created: true }
      component.object = mockObject
      const listener = vi.fn()
      component.willRender = listener

      component.render({}, {}, {})

      expect(listener).toHaveBeenCalled()
    })

    it('조건을 만족하지 않으면 실행되지 않는다', () => {
      const component = new Component({ enable: false })
      const listener = vi.fn()
      component.willRender = listener

      component.render({}, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/component.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/component.test.js
git commit -m "test: component.js 테스트 추가

- Component 생성자 테스트
- update() 조건부 실행 테스트
- render() 조건부 실행 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: object.js (게임 오브젝트) 테스트 (155줄, 0% → 80%+)

**Files:**
- Create: `tests/object.test.js`
- Test: `you/object.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Object } from '../you/object.js'
import { Component } from '../you/component.js'

describe('Object (Game Object)', () => {
  describe('constructor', () => {
    it('기본값으로 초기화한다', () => {
      const obj = new Object()

      expect(obj.name).toBe('')
      expect(obj.tags.size).toBe(0)
      expect(obj.components).toHaveLength(0)
      expect(obj.objects).toHaveLength(0)
      expect(obj.parent).toBeNull()
    })

    it('옵션으로 초기화한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({
        name: 'player',
        tags: ['enemy', 'unit'],
        components: [component],
        objects: [child]
      })

      expect(obj.name).toBe('player')
      expect(obj.tags.has('enemy')).toBe(true)
      expect(obj.tags.has('unit')).toBe(true)
      expect(obj.components).toContain(component)
      expect(obj.objects).toContain(child)
    })
  })

  describe('root', () => {
    it('parent가 없으면 null을 반환한다', () => {
      const obj = new Object()
      expect(obj.root).toBeNull()
    })

    it('parent가 있으면 root를 반환한다', () => {
      const grandparent = new Object()
      const parent = new Object()
      const child = new Object()

      grandparent.add(parent)
      parent.add(child)

      expect(child.root).toBe(grandparent)
    })
  })

  describe('create()', () => {
    it('컴포넌트와 자식 오브젝트도 create한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })

      // Component와 child의 create를 감시
      const componentCreate = vi.spyOn(component, 'create')
      const childCreate = vi.spyOn(child, 'create')

      obj.create()

      expect(componentCreate).toHaveBeenCalled()
      expect(childCreate).toHaveBeenCalled()
    })
  })

  describe('destroy()', () => {
    it('컴포넌트와 자식 오브젝트도 destroy한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })

      obj.create()

      const componentDestroy = vi.spyOn(component, 'destroy')
      const childDestroy = vi.spyOn(child, 'destroy')

      obj.destroy()

      expect(componentDestroy).toHaveBeenCalled()
      expect(childDestroy).toHaveBeenCalled()
    })

    it('parent에서 자신을 제거한다', () => {
      const parent = new Object()
      const child = new Object()
      parent.add(child)
      parent.create()

      child.destroy()

      expect(parent.objects).not.toContain(child)
      expect(child.parent).toBeNull()
    })
  })

  describe('update()', () => {
    it('컴포넌트와 자식 오브젝트도 update한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })
      obj.create()

      const componentUpdate = vi.spyOn(component, 'update')
      const childUpdate = vi.spyOn(child, 'update')

      obj.update(16, {}, {})

      expect(componentUpdate).toHaveBeenCalled()
      expect(childUpdate).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('컴포넌트와 자식 오브젝트도 render한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })
      obj.create()

      const componentRender = vi.spyOn(component, 'render')
      const childRender = vi.spyOn(child, 'render')

      obj.render({}, {}, {})

      expect(componentRender).toHaveBeenCalled()
      expect(childRender).toHaveBeenCalled()
    })
  })

  describe('add()', () => {
    it('자식 오브젝트를 추가한다', () => {
      const parent = new Object()
      const child = new Object()

      parent.add(child)

      expect(parent.objects).toContain(child)
      expect(child.parent).toBe(parent)
    })

    it('null/undefined를 추가하면 에러를 던진다', () => {
      const parent = new Object()

      expect(() => parent.add(null)).toThrow()
      expect(() => parent.add(undefined)).toThrow()
    })

    it('CREATED 상태이면 추가된 자식도 create한다', () => {
      const parent = new Object()
      parent.create()
      const child = new Object()

      parent.add(child)

      expect(child.created).toBe(true)
    })
  })

  describe('remove()', () => {
    it('자식 오브젝트를 제거한다', () => {
      const parent = new Object()
      const child = new Object()
      parent.add(child)

      const removed = parent.remove(child)

      expect(removed).toBe(child)
      expect(parent.objects).not.toContain(child)
      expect(child.parent).toBeNull()
    })

    it('존재하지 않는 오브젝트를 제거하면 null을 반환한다', () => {
      const parent = new Object()
      const notChild = new Object()

      const result = parent.remove(notChild)

      expect(result).toBeNull()
    })

    it('CREATED 상태이면 제거된 자식을 destroy한다', () => {
      const parent = new Object()
      const child = new Object()
      parent.add(child)
      parent.create()

      parent.remove(child)

      expect(child.destroyed).toBe(true)
    })
  })

  describe('find()', () => {
    it('이름으로 자식 오브젝트를 찾는다', () => {
      const parent = new Object()
      const child = new Object({ name: 'target' })
      parent.add(child)

      expect(parent.find('target')).toBe(child)
    })

    it('찾지 못하면 null을 반환한다', () => {
      const parent = new Object()

      expect(parent.find('nonexistent')).toBeNull()
    })
  })

  describe('findAll()', () => {
    it('같은 이름의 모든 자식을 찾는다', () => {
      const parent = new Object()
      const child1 = new Object({ name: 'target' })
      const child2 = new Object({ name: 'target' })
      const child3 = new Object({ name: 'other' })
      parent.add(child1)
      parent.add(child2)
      parent.add(child3)

      const found = parent.findAll('target')

      expect(found).toHaveLength(2)
      expect(found).toContain(child1)
      expect(found).toContain(child2)
    })
  })

  describe('findByTags()', () => {
    it('태그로 자식 오브젝트를 찾는다', () => {
      const parent = new Object()
      const child1 = new Object({ tags: ['enemy', 'unit'] })
      const child2 = new Object({ tags: ['ally', 'unit'] })
      parent.add(child1)
      parent.add(child2)

      const found = parent.findByTags(['enemy'])

      expect(found).toHaveLength(1)
      expect(found).toContain(child1)
    })

    it('여러 태그 조건을 OR로 검색한다', () => {
      const parent = new Object()
      const child1 = new Object({ tags: ['enemy'] })
      const child2 = new Object({ tags: ['ally'] })
      parent.add(child1)
      parent.add(child2)

      const found = parent.findByTags(['enemy'], ['ally'])

      expect(found).toHaveLength(2)
    })
  })

  describe('addComponent()', () => {
    it('컴포넌트를 추가한다', () => {
      const obj = new Object()
      const component = new Component()

      obj.addComponent(component)

      expect(obj.components).toContain(component)
      expect(component.object).toBe(obj)
    })
  })

  describe('removeComponent()', () => {
    it('컴포넌트를 제거한다', () => {
      const obj = new Object()
      const component = new Component()
      obj.addComponent(component)

      obj.removeComponent(component)

      expect(obj.components).not.toContain(component)
      expect(component.object).toBeNull()
    })
  })

  describe('findComponent()', () => {
    it('타입으로 컴포넌트를 찾는다', () => {
      const obj = new Object()
      const component = new Component()
      obj.addComponent(component)

      expect(obj.findComponent(Component)).toBe(component)
    })

    it('찾지 못하고 requirement=true이면 에러를 던진다', () => {
      const obj = new Object()

      expect(() => obj.findComponent(Component, true)).toThrow()
    })
  })

  describe('findAllComponent()', () => {
    it('타입의 모든 컴포넌트를 찾는다', () => {
      const obj = new Object()
      const comp1 = new Component()
      const comp2 = new Component()
      obj.addComponent(comp1)
      obj.addComponent(comp2)

      const found = obj.findAllComponent(Component)

      expect(found).toHaveLength(2)
    })

    it('찾지 못하고 requirement=true이면 에러를 던진다', () => {
      const obj = new Object()

      expect(() => obj.findAllComponent(Component, true)).toThrow()
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/object.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/object.test.js
git commit -m "test: object.js (게임 오브젝트) 테스트 추가

- 생성자 및 초기화 테스트
- 라이프사이클 (create, destroy, update, render) 테스트
- 자식 오브젝트 관리 (add, remove, find, findAll, findByTags) 테스트
- 컴포넌트 관리 (addComponent, removeComponent, findComponent) 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: camera.js 테스트 (46줄, 0% → 80%+)

**Files:**
- Create: `tests/camera.test.js`
- Test: `you/camera.js`

**Step 1: 테스트 파일 생성**

```javascript
import { describe, it, expect } from 'vitest'
import '../you/math/vector.js'
import { Camera } from '../you/camera.js'

describe('Camera', () => {
  const createMockScreen = (size = [800, 600]) => ({
    size: size.slice()
  })

  describe('constructor', () => {
    it('screen을 설정하고 position을 [0,0]으로 초기화한다', () => {
      const screen = createMockScreen()
      const camera = new Camera(screen)

      expect(camera.screen).toBe(screen)
      expect(camera.position).toEqual([0, 0])
      expect(camera.size).toEqual([800, 600])
    })
  })

  describe('scale', () => {
    it('화면 크기 / 카메라 크기를 반환한다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.size = [400, 300] // 2배 확대

      const scale = camera.scale

      expect(scale[0]).toBeCloseTo(2)
      expect(scale[1]).toBeCloseTo(2)
    })

    it('scale을 설정하면 size가 변경된다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)

      camera.scale = [2, 2]

      expect(camera.size[0]).toBeCloseTo(400)
      expect(camera.size[1]).toBeCloseTo(300)
    })
  })

  describe('toWorld()', () => {
    it('스크린 좌표를 월드 좌표로 변환한다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [100, 100]

      // 화면 중앙 (400, 300)은 카메라 위치 (100, 100)
      const world = camera.toWorld([400, 300])

      expect(world[0]).toBeCloseTo(100)
      expect(world[1]).toBeCloseTo(100)
    })

    it('화면 왼쪽 상단은 카메라 왼쪽 상단', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [0, 0]

      // 화면 좌상단 (0, 0) → 월드 (-400, -300)
      const world = camera.toWorld([0, 0])

      expect(world[0]).toBeCloseTo(-400)
      expect(world[1]).toBeCloseTo(-300)
    })
  })

  describe('toScreen()', () => {
    it('월드 좌표를 스크린 좌표로 변환한다', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [100, 100]

      // 카메라 위치 (100, 100)은 화면 중앙 (400, 300)
      const screenPos = camera.toScreen([100, 100])

      expect(screenPos[0]).toBeCloseTo(400)
      expect(screenPos[1]).toBeCloseTo(300)
    })

    it('toWorld와 toScreen은 역함수 관계', () => {
      const screen = createMockScreen([800, 600])
      const camera = new Camera(screen)
      camera.position = [50, 75]

      const original = [200, 150]
      const world = camera.toWorld(original)
      const back = camera.toScreen(world)

      expect(back[0]).toBeCloseTo(original[0])
      expect(back[1]).toBeCloseTo(original[1])
    })
  })
})
```

**Step 2: 테스트 실행 확인**

Run: `pnpm vitest run tests/camera.test.js`
Expected: PASS

**Step 3: 커밋**

```bash
git add tests/camera.test.js
git commit -m "test: camera.js 테스트 추가

- Camera 생성자 테스트
- scale getter/setter 테스트
- toWorld() 좌표 변환 테스트
- toScreen() 좌표 변환 테스트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: 커버리지 확인 및 추가 테스트

**Step 1: 전체 커버리지 확인**

Run: `pnpm vitest run --coverage`

**Step 2: 80% 미달 파일 식별 및 추가 테스트 작성**

필요시 다음 파일들의 테스트를 보강:
- `math/geometry.js` - 미커버 라인 추가 테스트
- `utilities/procedure.js` - 미커버 라인 추가 테스트
- `utilities/event.js` - remove() 특정 리스너 제거 테스트

**Step 3: 최종 커밋**

```bash
git add tests/
git commit -m "test: 테스트 커버리지 80% 달성

- 전체 커버리지 목표 달성 확인
- 미커버 코드 추가 테스트 작성

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## 제외 대상

다음 파일들은 통합 테스트가 필요하거나 테스트하기 어려운 구조:

- `engine.js` - 전체 시스템 초기화, 통합 테스트 필요
- `scene.js` - Camera, View 의존성, 부분 테스트만 가능
- `utilities/resource.js` - fetch, import() 모킹 복잡
- `graphics/*` - Canvas API 의존, 시각적 테스트 필요
- `ui/view.js` - 이벤트 처리 복잡
- `framework/input.js`, `framework/loop.js` - 브라우저 API 의존

이 파일들은 커버리지 목표에서 제외하거나, 별도의 통합 테스트 계획으로 진행.

---

**Plan complete and saved to `docs/plans/2026-01-11-test-coverage-80.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
