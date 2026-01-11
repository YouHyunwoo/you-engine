# You-Engine 코드 정비 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** HIGH 심각도 버그 16개를 수정하여 엔진 안정성 확보

**Architecture:** 기존 코드의 버그를 TDD 방식으로 수정. 각 이슈별로 테스트 작성 → 실패 확인 → 구현 → 통과 순서로 진행

**Tech Stack:** JavaScript (ES6 modules), Vitest

---

## Task 1: EventEmitter 리스너 제거 버그 수정

**Files:**
- Modify: `you/utilities/event.js:15-28`
- Test: `tests/event-emitter.test.js`

**Step 1: Write the failing test**

```javascript
// tests/event-emitter.test.js 에 추가
describe('리스너 제거', () => {
  it('등록한 리스너를 제거할 수 있다', () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    emitter.remove('test', handler)
    emitter.emit('test')

    expect(handler).not.toHaveBeenCalled()
  })

  it('특정 리스너만 제거된다', () => {
    const emitter = new EventEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('test', handler1)
    emitter.on('test', handler2)
    emitter.remove('test', handler1)
    emitter.emit('test')

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/event-emitter.test.js`
Expected: FAIL - handler가 여전히 호출됨 (bound 함수와 원본 함수 비교 불가)

**Step 3: Write minimal implementation**

`you/utilities/event.js` 수정:

```javascript
on(event, listener, count=-1) {
    if (count === 0) { return }

    if (!(event in this.eventGroups)) {
        this.eventGroups[event] = [];
    }

    // [boundListener, originalListener, count] 형태로 저장
    this.eventGroups[event].push([
        listener.bind(this.bindingObject),
        listener,
        count
    ]);
}

remove(event, listener=null) {
    if (listener === null) {
        delete this.eventGroups[event];
    }
    else if (event in this.eventGroups) {
        // 원본 리스너(index 1)로 비교
        const index = this.eventGroups[event].findIndex(l => l[1] === listener);

        if (index >= 0) {
            this.eventGroups[event].splice(index, 1);
        }
    }
}

emit(event, ...args) {
    const listeners = this.eventGroups[event];
    if (!listeners) { return }

    for (const entry of listeners) {
        const [boundListener, , count] = entry;

        if (count === 0) { continue }

        boundListener?.(...args);

        if (count > 0) {
            entry[2] -= 1;
        }
    }

    this.eventGroups[event] = listeners.filter(([, , count]) => count !== 0);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/event-emitter.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/utilities/event.js tests/event-emitter.test.js
git commit -m "fix: EventEmitter 리스너 제거 버그 수정"
```

---

## Task 2: Loop.stop() cancelAnimationFrame 추가

**Files:**
- Modify: `you/framework/loop.js:20-22`
- Test: `tests/loop.test.js`

**Step 1: Write the failing test**

```javascript
// tests/loop.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Loop } from '../you/framework/loop.js'

describe('Loop', () => {
  let mockEngine
  let originalRAF
  let originalCAF

  beforeEach(() => {
    mockEngine = {
      applications: [],
      event: { clear: vi.fn() },
      input: {},
      output: { screens: {} }
    }

    originalRAF = window.requestAnimationFrame
    originalCAF = window.cancelAnimationFrame

    window.requestAnimationFrame = vi.fn((cb) => {
      const id = Math.random()
      return id
    })
    window.cancelAnimationFrame = vi.fn()
  })

  afterEach(() => {
    window.requestAnimationFrame = originalRAF
    window.cancelAnimationFrame = originalCAF
  })

  describe('stop', () => {
    it('cancelAnimationFrame을 호출한다', () => {
      const loop = new Loop(mockEngine)

      window.requestAnimationFrame.mockReturnValue(123)
      loop.start()

      // RAF 콜백 실행 시뮬레이션
      const rafCallback = window.requestAnimationFrame.mock.calls[0][0]
      rafCallback(16)

      loop.stop()

      expect(window.cancelAnimationFrame).toHaveBeenCalledWith(loop.handle)
    })

    it('stop 후 handle이 null이다', () => {
      const loop = new Loop(mockEngine)
      loop.start()
      loop.stop()

      expect(loop.handle).toBe(null)
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/loop.test.js`
Expected: FAIL - cancelAnimationFrame이 호출되지 않음

**Step 3: Write minimal implementation**

`you/framework/loop.js` 수정:

```javascript
stop() {
    if (this.handle !== null) {
        window.cancelAnimationFrame(this.handle);
    }
    this.handle = null;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/loop.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/framework/loop.js tests/loop.test.js
git commit -m "fix: Loop.stop()에서 cancelAnimationFrame 호출"
```

---

## Task 3: Vector.normalize() 0 벡터 처리

**Files:**
- Modify: `you/math/vector.js:63-65`
- Test: `tests/vector.test.js`

**Step 1: Write the failing test**

```javascript
// tests/vector.test.js 에 추가
describe('normalize', () => {
  it('일반 벡터를 정규화한다', () => {
    const result = [3, 4].normalize()
    expect(result[0]).toBeCloseTo(0.6)
    expect(result[1]).toBeCloseTo(0.8)
  })

  it('영벡터는 영벡터를 반환한다', () => {
    const result = [0, 0].normalize()
    expect(result).toEqual([0, 0])
  })

  it('영벡터 정규화 시 Infinity가 아닌 0을 반환한다', () => {
    const result = [0, 0].normalize()
    expect(Number.isFinite(result[0])).toBe(true)
    expect(Number.isFinite(result[1])).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/vector.test.js`
Expected: FAIL - [0, 0].normalize()가 [Infinity, Infinity] 반환

**Step 3: Write minimal implementation**

`you/math/vector.js` 수정:

```javascript
Array.prototype.normalize = function () {
    const mag = this.magnitude;
    if (mag === 0) {
        return this.slice();
    }
    return this.div(mag);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/vector.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/math/vector.js tests/vector.test.js
git commit -m "fix: Vector.normalize() 영벡터 처리"
```

---

## Task 4: Vector 에러 메시지 추가

**Files:**
- Modify: `you/math/vector.js:3,13,23,33,42,47,69`
- Test: `tests/vector.test.js`

**Step 1: Write the failing test**

```javascript
// tests/vector.test.js 에 추가
describe('에러 메시지', () => {
  it('add 길이 불일치 시 의미 있는 에러 메시지', () => {
    expect(() => [1, 2].add([1, 2, 3])).toThrow(/length/i)
  })

  it('sub 길이 불일치 시 의미 있는 에러 메시지', () => {
    expect(() => [1, 2].sub([1, 2, 3])).toThrow(/length/i)
  })

  it('mul 길이 불일치 시 의미 있는 에러 메시지', () => {
    expect(() => [1, 2].mul([1, 2, 3])).toThrow(/length/i)
  })

  it('div 길이 불일치 시 의미 있는 에러 메시지', () => {
    expect(() => [1, 2].div([1, 2, 3])).toThrow(/length/i)
  })

  it('dot 길이 불일치 시 의미 있는 에러 메시지', () => {
    expect(() => [1, 2].dot([1, 2, 3])).toThrow(/length/i)
  })

  it('equals 길이 불일치 시 의미 있는 에러 메시지', () => {
    expect(() => [1, 2].equals([1, 2, 3])).toThrow(/length/i)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/vector.test.js`
Expected: FAIL - 에러 메시지가 비어 있음

**Step 3: Write minimal implementation**

`you/math/vector.js` 수정:

```javascript
Array.prototype.add = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) {
            throw new Error(`Vector length mismatch: ${this.length} vs ${other.length}`)
        }
        return this.map((value, index) => value + other[index]);
    }
    else {
        return this.map(value => value + other);
    }
};

Array.prototype.sub = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) {
            throw new Error(`Vector length mismatch: ${this.length} vs ${other.length}`)
        }
        return this.map((value, index) => value - other[index]);
    }
    else {
        return this.map(value => value - other);
    }
};

Array.prototype.mul = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) {
            throw new Error(`Vector length mismatch: ${this.length} vs ${other.length}`)
        }
        return this.map((value, index) => value * other[index]);
    }
    else {
        return this.map(value => value * other);
    }
};

Array.prototype.div = function (other) {
    if (other instanceof Array) {
        if (this.length !== other.length) {
            throw new Error(`Vector length mismatch: ${this.length} vs ${other.length}`)
        }
        return this.map((value, index) => value / other[index]);
    }
    else {
        return this.map(value => value / other);
    }
};

Array.prototype.equals = function (other) {
    if (this.length !== other.length) {
        throw new Error(`Vector length mismatch: ${this.length} vs ${other.length}`)
    }
    return this.every((v, i) => v === other[i]);
}

Array.prototype.dot = function (other) {
    if (this.length !== other.length) {
        throw new Error(`Vector length mismatch: ${this.length} vs ${other.length}`)
    }
    return this.reduce((acc, cur, idx) => acc + cur * other[idx], 0);
}

Array.zeros = function (...shape) {
    if (shape.length < 1) {
        throw new Error('Array.zeros requires at least one dimension');
    }
    else if (shape.length === 1) {
        return Array.repeat(shape[0], 0);
    }
    else {
        return Array.repeat(shape.at(-1), () => Array.zeros(...shape.slice(0, -1)));
    }
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/vector.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/math/vector.js tests/vector.test.js
git commit -m "fix: Vector 연산 에러 메시지 추가"
```

---

## Task 5: SpriteAnimation fps 검증

**Files:**
- Modify: `you/graphics/sprite-animation.js:25-33`
- Test: `tests/sprite-animation.test.js`

**Step 1: Write the failing test**

```javascript
// tests/sprite-animation.test.js 에 추가
describe('fps 검증', () => {
  it('fps가 0이면 에러 발생', () => {
    expect(() => new SpriteAnimation({
      sprite: mockSprite,
      grid: { cols: 4, count: 4 },
      fps: 0
    })).toThrow(/fps/i)
  })

  it('fps가 음수면 에러 발생', () => {
    expect(() => new SpriteAnimation({
      sprite: mockSprite,
      grid: { cols: 4, count: 4 },
      fps: -1
    })).toThrow(/fps/i)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/sprite-animation.test.js`
Expected: FAIL - fps=0이 허용됨

**Step 3: Write minimal implementation**

`you/graphics/sprite-animation.js` 수정:

```javascript
constructor({
    sprite,
    frames = null,
    grid = null,
    fps = 12,
    loop = true,
}) {
    if (!sprite) throw new Error('sprite is required')
    if (!frames && !grid) throw new Error('frames or grid is required')
    if (fps <= 0) throw new Error('fps must be positive')

    this.sprite = sprite
    this.fps = fps
    // ... 나머지 동일
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/sprite-animation.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/graphics/sprite-animation.js tests/sprite-animation.test.js
git commit -m "fix: SpriteAnimation fps 양수 검증 추가"
```

---

## Task 6: Application.render() null 체크

**Files:**
- Modify: `you/application.js:34-45,89-102`
- Test: `tests/application.test.js`

**Step 1: Write the failing test**

```javascript
// tests/application.test.js
import { describe, it, expect, vi } from 'vitest'
import { Application, SceneApplication } from '../you/application.js'

describe('Application', () => {
  describe('render', () => {
    it('존재하지 않는 mainScreen에서 크래시하지 않는다', () => {
      const app = new Application({ mainScreen: 'nonexistent' })
      const screens = {
        main: {
          context: { clearRect: vi.fn() },
          canvas: { width: 800, height: 600 }
        }
      }

      expect(() => app.render(screens)).not.toThrow()
    })

    it('mainScreen이 null일 때 크래시하지 않는다', () => {
      const app = new Application({ mainScreen: null })
      const screens = {}

      expect(() => app.render(screens)).not.toThrow()
    })
  })
})

describe('SceneApplication', () => {
  describe('render', () => {
    it('존재하지 않는 mainScreen에서 크래시하지 않는다', () => {
      const app = new SceneApplication({ mainScreen: 'nonexistent' })
      const screens = {}

      expect(() => app.render(screens)).not.toThrow()
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/application.test.js`
Expected: FAIL - Cannot read property 'context' of undefined

**Step 3: Write minimal implementation**

`you/application.js` 수정:

```javascript
// Application.render()
render(screens) {
    Object.keys(screens).forEach(screenId => {
        const screen = screens[screenId];
        screen.context.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
    });

    const mainScreen = screens[this.mainScreen];
    if (!mainScreen) {
        console.warn(`Screen not found: ${this.mainScreen}`);
        return;
    }
    const mainScreenContext = mainScreen.context;

    super.render(mainScreenContext, mainScreen, screens);
}

// SceneApplication.render()
render(screens) {
    Object.keys(screens).forEach(screenId => {
        const screen = screens[screenId];
        screen.context.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
    });

    const mainScreen = screens[this.mainScreen];
    if (!mainScreen) {
        console.warn(`Screen not found: ${this.mainScreen}`);
        return;
    }
    const mainScreenContext = mainScreen.context;

    this.willRender(mainScreenContext, mainScreen, screens);
    this.scenes[0]?.render(mainScreenContext, mainScreen, screens);
    this.didRender(mainScreenContext, mainScreen, screens);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/application.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/application.js tests/application.test.js
git commit -m "fix: Application.render() mainScreen null 체크"
```

---

## Task 7: Output 포인터 락 리스너 중복 방지

**Files:**
- Modify: `you/framework/output.js:12-27`
- Test: `tests/output.test.js`

**Step 1: Write the failing test**

```javascript
// tests/output.test.js 에 추가
describe('lockPointer 리스너 중복 방지', () => {
  it('여러 번 lockPointer 호출해도 리스너는 한 번만 등록된다', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

    const output = new Output(mockEngine)
    output.addScreen('main', mockScreen)

    output.lockPointer('main')
    output.lockPointer('main')
    output.lockPointer('main')

    const pointerLockCalls = addEventListenerSpy.mock.calls.filter(
      call => call[0] === 'pointerlockchange'
    )

    expect(pointerLockCalls.length).toBe(1)

    addEventListenerSpy.mockRestore()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/output.test.js`
Expected: FAIL - 3번 등록됨

**Step 3: Write minimal implementation**

`you/framework/output.js` 수정:

```javascript
export class Output {

    constructor(engine) {
        this.engine = engine;
        this.screens = {};
        this._pointerLockListener = null;
    }

    addScreen(id, screen) {
        this.screens[id] = screen;
    }

    lockPointer(id) {
        const screen = this.screens[id];
        if (!screen) {
            console.warn(`Screen not found: ${id}`);
            return;
        }
        const canvas = screen.canvas;

        // 기존 리스너가 없을 때만 등록
        if (!this._pointerLockListener) {
            this._pointerLockListener = () => {
                if (document.pointerLockElement === canvas ||
                    document.mozPointerLockElement === canvas) {
                    this.engine.input.lockPointer();
                }
                else {
                    this.engine.input.unlockPointer();
                }
            };
            document.addEventListener('pointerlockchange', this._pointerLockListener);
        }

        canvas.requestPointerLock();
    }

    unlockPointer() {
        document.exitPointerLock();
    }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/output.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/framework/output.js tests/output.test.js
git commit -m "fix: Output 포인터 락 리스너 중복 등록 방지"
```

---

## Task 8: Loopable.render() 시그니처 수정

**Files:**
- Modify: `you/framework/object.js:57-58`
- Test: `tests/framework-object.test.js`

**Step 1: Write the failing test**

```javascript
// tests/framework-object.test.js 에 추가
describe('Loopable.render 시그니처', () => {
  it('willRender에 3개 파라미터가 전달된다', () => {
    const loopable = new Loopable()
    loopable.willRender = vi.fn()

    const context = {}
    const screen = {}
    const screens = {}

    loopable.render(context, screen, screens)

    expect(loopable.willRender).toHaveBeenCalledWith(context, screen, screens)
  })

  it('didRender에 3개 파라미터가 전달된다', () => {
    const loopable = new Loopable()
    loopable.didRender = vi.fn()

    const context = {}
    const screen = {}
    const screens = {}

    loopable.render(context, screen, screens)

    expect(loopable.didRender).toHaveBeenCalledWith(context, screen, screens)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/framework-object.test.js`
Expected: FAIL - willRender/didRender가 (screens) 시그니처로 정의됨

**Step 3: Write minimal implementation**

`you/framework/object.js` 수정:

```javascript
// Loopable 클래스 내
willRender(context, screen, screens) {}
didRender(context, screen, screens) {}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/framework-object.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/framework/object.js tests/framework-object.test.js
git commit -m "fix: Loopable.willRender/didRender 시그니처 수정"
```

---

## Task 9: Resource.clear() for...in 수정

**Files:**
- Modify: `you/resource.js:29-33`
- Test: `tests/resource.test.js`

**Step 1: Write the failing test**

```javascript
// tests/resource.test.js
import { describe, it, expect } from 'vitest'
import { Resource } from '../you/resource.js'

describe('Resource', () => {
  describe('clear', () => {
    it('prefix 속성은 유지된다', () => {
      const resource = new Resource({ prefix: 'test/' })
      resource.testData = { foo: 'bar' }

      resource.clear()

      expect(resource.prefix).toBe('test/')
    })

    it('동적으로 추가된 리소스는 삭제된다', () => {
      const resource = new Resource({ prefix: 'test/' })
      resource.testData = { foo: 'bar' }

      resource.clear()

      expect(resource.testData).toBeUndefined()
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/resource.test.js`
Expected: FAIL - prefix도 삭제됨

**Step 3: Write minimal implementation**

`you/resource.js` 수정:

```javascript
clear() {
    const preserveKeys = ['prefix'];
    Object.keys(this)
        .filter(key => !preserveKeys.includes(key))
        .forEach(key => {
            delete this[key];
        });
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/resource.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/resource.js tests/resource.test.js
git commit -m "fix: Resource.clear()에서 prefix 속성 보존"
```

---

## Task 10: utilities/resource.js 에러 핸들링

**Files:**
- Modify: `you/utilities/resource.js:6-25,111-118`
- Test: `tests/utilities-resource.test.js`

**Step 1: Write the failing test**

```javascript
// tests/utilities-resource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import resource from '../you/utilities/resource.js'

describe('resource.json.load', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('네트워크 오류 시 의미 있는 에러를 던진다', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    })

    await expect(resource.json.load('test.json'))
      .rejects.toThrow(/404/)
  })

  it('존재하지 않는 accessor 접근 시 에러를 던진다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ foo: { bar: 'baz' } })
    })

    await expect(resource.json.load('test.json:foo.nonexistent.path'))
      .rejects.toThrow(/accessor/i)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/utilities-resource.test.js`
Expected: FAIL - null 반환하거나 undefined 접근

**Step 3: Write minimal implementation**

`you/utilities/resource.js` 수정:

```javascript
async function loadJSON(url) {
    let accessors = [];

    if (url.includes(':')) {
        const items = url.split(':');
        url = items[0];
        accessors = items.slice(1).join(':').split('.');
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
    }

    let data = await response.json();

    for (const accessor of accessors) {
        if (data === null || data === undefined) {
            throw new Error(`Accessor "${accessor}" not found: path terminated early`);
        }
        if (!(accessor in data)) {
            throw new Error(`Accessor "${accessor}" not found in data`);
        }
        data = data[accessor];
    }

    return data;
}

async function parseCustomClassString(string) {
    const isCustomClassString = string.includes(':');
    if (!isCustomClassString) {
        throw new Error(`Invalid custom class syntax: ${string}`);
    }

    const [url, ...nameSlice] = string.split(':');
    const name = nameSlice.join(':');
    return await loadClass(url, name);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/utilities-resource.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/utilities/resource.js tests/utilities-resource.test.js
git commit -m "fix: utilities/resource.js 에러 핸들링 개선"
```

---

## Task 11: Progress 연산자 우선순위 명확화

**Files:**
- Modify: `you/utilities/progress.js:14-15`
- Test: `tests/progress.test.js`

**Step 1: Write the failing test (괄호 명확화 확인)**

```javascript
// tests/progress.test.js 에 추가
describe('update 종료 조건', () => {
  it('정방향 진행 시 1 이상에서 종료', () => {
    const progress = new Progress(1, false)
    progress.value = 1

    const updateSpy = vi.fn()
    progress.event.on('update', updateSpy)

    progress.update(0.1)

    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('역방향 진행 시 0 이하에서 종료', () => {
    const progress = new Progress(-1, false)
    progress.value = 0

    const updateSpy = vi.fn()
    progress.event.on('update', updateSpy)

    progress.update(0.1)

    expect(updateSpy).not.toHaveBeenCalled()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/progress.test.js`
Expected: 현재 동작 확인 (로직은 맞을 수 있으나 괄호 명확화 필요)

**Step 3: Write minimal implementation**

`you/utilities/progress.js` 수정:

```javascript
update(delta, ...args) {
    if (!this.repeat &&
        ((this.speed > 0 && this.value >= 1) ||
         (this.speed < 0 && this.value <= 0))) {
        return;
    }
    // ... 나머지 동일
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/progress.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/utilities/progress.js tests/progress.test.js
git commit -m "fix: Progress.update() 연산자 우선순위 명확화"
```

---

## Task 12: TweenComponent 배열 안전성

**Files:**
- Modify: `you/animation/tween-component.js:91-125`
- Test: `tests/tween-component.test.js`

**Step 1: Write the failing test**

```javascript
// tests/tween-component.test.js 에 추가
describe('여러 트윈 동시 종료', () => {
  it('동시에 여러 트윈이 종료되어도 안전하게 처리', () => {
    const tweenComponent = new TweenComponent()
    tweenComponent.object = { a: 0, b: 0, c: 0 }

    tweenComponent.run({ property: 'a', to: 10, duration: 100 })
    tweenComponent.run({ property: 'b', to: 20, duration: 100 })
    tweenComponent.run({ property: 'c', to: 30, duration: 100 })

    // 모든 트윈이 한 번에 종료되도록 큰 deltaTime
    expect(() => {
      tweenComponent.willUpdate(200, [], {})
    }).not.toThrow()

    expect(tweenComponent.object.a).toBe(10)
    expect(tweenComponent.object.b).toBe(20)
    expect(tweenComponent.object.c).toBe(30)
    expect(tweenComponent._tweens.length).toBe(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/tween-component.test.js`
Expected: 통과해야 함 (현재 역방향 순회로 안전하지만 확인)

**Step 3: Write minimal implementation (안전성 강화)**

`you/animation/tween-component.js` 수정 - filter 사용으로 개선:

```javascript
willUpdate(deltaTime, events, input) {
    if (!this.object) return;

    for (const tween of this._tweens) {
        // 첫 업데이트 시 from 값 설정
        if (!tween.started) {
            tween.started = true;
            if (tween.from === null) {
                tween.from = this._getValue(tween.property);
            }
        }

        tween.elapsed += deltaTime;

        const progress = Math.min(tween.elapsed / tween.duration, 1);
        const easedProgress = tween.easing(progress);

        // 값 보간
        const value = this._interpolate(tween.from, tween.to, easedProgress);
        this._setValue(tween.property, value);

        if (tween.onUpdate) {
            tween.onUpdate(value, progress);
        }

        // 완료 체크
        if (tween.elapsed >= tween.duration) {
            this._setValue(tween.property, tween.to);

            if (tween.onFinish) {
                tween.onFinish(tween.to);
            }

            tween.finished = true;
        }
    }

    // 완료된 트윈 제거 (filter 사용)
    this._tweens = this._tweens.filter(t => !t.finished);
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/tween-component.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/animation/tween-component.js tests/tween-component.test.js
git commit -m "fix: TweenComponent 배열 순회 안전성 개선"
```

---

## Task 13: Audio.currentTime NaN 방지

**Files:**
- Modify: `you/audio/audio.js:90-93`
- Test: `tests/audio.test.js`

**Step 1: Write the failing test**

```javascript
// tests/audio.test.js 에 추가
describe('currentTime', () => {
  it('로드 전 currentTime은 0', () => {
    const audio = new Audio({ src: 'test.mp3' })

    expect(audio.currentTime).toBe(0)
    expect(Number.isFinite(audio.currentTime)).toBe(true)
  })

  it('duration이 0일 때 currentTime은 NaN이 아니다', () => {
    const audio = new Audio({ src: 'test.mp3' })
    audio._loaded = true
    audio._playing = true
    audio._startTime = 0
    // duration은 0 (buffer 없음)

    expect(Number.isNaN(audio.currentTime)).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/audio.test.js`
Expected: FAIL - duration=0일 때 NaN 반환

**Step 3: Write minimal implementation**

`you/audio/audio.js` 수정:

```javascript
get currentTime() {
    if (!this._playing) return this._pauseTime;
    if (!this.duration || this.duration === 0) return 0;
    return (Audio.context.currentTime - this._startTime) % this.duration;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/audio.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/audio/audio.js tests/audio.test.js
git commit -m "fix: Audio.currentTime NaN 방지"
```

---

## Task 14: AudioManager.load() 에러 전파

**Files:**
- Modify: `you/audio/audio-manager.js:39-65`
- Test: `tests/audio-manager.test.js`

**Step 1: Write the failing test**

```javascript
// tests/audio-manager.test.js 에 추가
describe('load 에러 처리', () => {
  it('로드 실패 시 에러가 전파된다', async () => {
    const manager = new AudioManager()

    // Audio 로드 실패 시뮬레이션
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

    await expect(manager.load('test', 'invalid.mp3'))
      .rejects.toThrow()

    vi.restoreAllMocks()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/audio-manager.test.js`
Expected: FAIL - Promise rejection이 처리되지 않음

**Step 3: Write minimal implementation**

`you/audio/audio-manager.js` 수정:

```javascript
async load(id, src, poolSize = 1) {
    const pool = [];

    for (let i = 0; i < poolSize; i++) {
        const audio = new Audio({ src });

        audio.event.on('error', (error) => {
            this.event.emit('error', id, error);
        });

        pool.push(audio);
    }

    try {
        // 모든 인스턴스 로드 대기
        await Promise.all(pool.map(audio => audio.loadPromise));
    } catch (error) {
        // 에러 발생 시 풀 정리하고 재throw
        console.error(`Failed to load audio '${id}':`, error);
        throw error;
    }

    this._pools[id] = pool;
    this.event.emit('load', id);

    // 모든 사운드 로드 완료 확인
    const allLoaded = Object.values(this._pools).every(
        pool => pool.every(audio => audio.loaded)
    );
    if (allLoaded && Object.keys(this._pools).length > 0) {
        this.event.emit('loadAll');
    }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/audio-manager.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add you/audio/audio-manager.js tests/audio-manager.test.js
git commit -m "fix: AudioManager.load() 에러 전파"
```

---

## Task 15: 기존 테스트 전체 통과 확인

**Files:**
- None (검증만)

**Step 1: 전체 테스트 실행**

Run: `pnpm test`
Expected: 모든 테스트 통과

**Step 2: 커버리지 확인**

Run: `pnpm test -- --coverage`
Expected: 80% 이상 유지

**Step 3: 최종 커밋**

```bash
git add .
git commit -m "chore: 코드 정비 완료 - HIGH 이슈 14개 수정"
```

---

## 요약

| Task | 파일 | 이슈 |
|------|------|------|
| 1 | event.js | EventEmitter 리스너 제거 버그 |
| 2 | loop.js | cancelAnimationFrame 누락 |
| 3 | vector.js | normalize 0 벡터 처리 |
| 4 | vector.js | 에러 메시지 추가 |
| 5 | sprite-animation.js | fps 검증 |
| 6 | application.js | mainScreen null 체크 |
| 7 | output.js | 포인터 락 리스너 중복 |
| 8 | object.js | render 시그니처 수정 |
| 9 | resource.js | clear() for...in 수정 |
| 10 | utilities/resource.js | 에러 핸들링 |
| 11 | progress.js | 연산자 우선순위 |
| 12 | tween-component.js | 배열 안전성 |
| 13 | audio.js | currentTime NaN |
| 14 | audio-manager.js | 에러 전파 |
| 15 | - | 전체 테스트 검증 |
