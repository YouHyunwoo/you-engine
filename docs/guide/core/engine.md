# Engine

Engine은 게임의 모든 서브시스템을 관리하는 핵심 클래스입니다.

## 개요

```javascript
import { You } from './you/you.js'

You.run({
  screens: { ... },
  applications: [ ... ]
})
```

`You.run()`을 호출하면 내부적으로 Engine 인스턴스가 생성되고 설정됩니다.

## 서브시스템

Engine은 4개의 서브시스템을 관리합니다.

| 시스템 | 역할 |
|--------|------|
| `loop` | 게임 루프 (requestAnimationFrame) |
| `event` | 이벤트 시스템 |
| `input` | 입력 처리 (키보드, 마우스) |
| `output` | 출력 처리 (스크린 관리) |

## 설정

### screens

스크린 설정입니다. 각 스크린은 canvas 요소와 크기를 지정합니다.

```javascript
You.run({
  screens: {
    main: {
      canvas: document.querySelector('canvas'),
      size: [800, 600]
    },
    // 여러 스크린 가능
    ui: {
      canvas: document.querySelector('#ui-canvas'),
      size: [800, 600]
    }
  },
  // ...
})
```

스크린을 지정하지 않으면 800x600 크기의 기본 스크린이 생성됩니다.

### applications

실행할 Application 인스턴스 배열입니다.

```javascript
You.run({
  screens: { ... },
  applications: [
    new MyGame({ mainScreen: 'main' }),
    new DebugOverlay({ mainScreen: 'main' })
  ]
})
```

## 라이프사이클

```
You.run() 호출
    ↓
Engine 생성
    ↓
스크린 설정
    ↓
Application 등록
    ↓
Engine.start()
    ├── Application.load()
    ├── Application.create()
    ├── Input 연결
    └── Loop 시작
        ↓
    [게임 루프]
    ├── update(deltaTime)
    └── render(screens)
```

## Engine 접근

Application, Scene, Object 내에서 engine에 접근할 수 있습니다.

```javascript
// Application 내에서
class MyGame extends SceneApplication {
  didCreate() {
    console.log(this.engine.input)  // Input 시스템
  }
}

// Scene 내에서
class MainScene extends Scene {
  didUpdate(deltaTime) {
    const input = this.application.engine.input
    if (input.isKeyDown('Space')) {
      // ...
    }
  }
}
```

## 다음

- [Application](application.md) - 애플리케이션 구조
- [Input](../systems/input.md) - 입력 시스템 상세
