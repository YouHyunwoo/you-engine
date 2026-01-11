# Application

Application은 게임의 최상위 컨테이너입니다. 대부분의 경우 씬 관리 기능이 포함된 SceneApplication을 사용합니다.

## 클래스 계층

```
Loopable
    └── Application
            └── SceneApplication
```

## Application

기본 애플리케이션 클래스입니다. 단순한 게임이나 씬 관리가 필요 없는 경우 사용합니다.

```javascript
import { Application } from './you/application.js'

class SimpleApp extends Application {
  didCreate() {
    console.log('앱 시작')
  }

  didUpdate(deltaTime) {
    // 게임 로직
  }

  didRender(context) {
    context.fillStyle = 'white'
    context.fillText('Hello', 100, 100)
  }
}
```

### 생성자 옵션

```javascript
new Application({
  mainScreen: 'main',      // 메인 스크린 ID
  resourcePrefix: 'res/',  // 리소스 경로 접두사
  events: {                // 이벤트 핸들러
    willCreate: () => {},
    didCreate: () => {},
  }
})
```

### 속성

| 속성 | 설명 |
|------|------|
| `engine` | Engine 인스턴스 |
| `screen` | 메인 스크린 |
| `resources` | Resource 인스턴스 |

## SceneApplication

씬 스택을 관리하는 애플리케이션입니다. 대부분의 게임에서 사용합니다.

```javascript
import { SceneApplication } from './you/application.js'
import { Scene } from './you/scene.js'

class TitleScene extends Scene { /* ... */ }
class GameScene extends Scene { /* ... */ }

class MyGame extends SceneApplication {
  didCreate() {
    this.push(new TitleScene())
  }
}
```

### 씬 스택 관리

```javascript
// 씬 추가 (스택에 push)
this.push(new GameScene(), arg1, arg2)

// 현재 씬 제거 (스택에서 pop)
this.pop(exitArg1, exitArg2)

// 씬 전환 (pop + push)
this.transit(new NextScene(), {
  exitArgs: [exitArg],
  enterArgs: [enterArg]
})
```

### 씬 스택 동작

```
초기 상태: []

push(TitleScene)
스택: [TitleScene]  ← 현재 활성 씬

push(PauseScene)
스택: [PauseScene, TitleScene]  ← PauseScene이 활성

pop()
스택: [TitleScene]  ← TitleScene으로 복귀

transit(GameScene)
스택: [GameScene]  ← TitleScene 제거, GameScene 추가
```

## 라이프사이클 메서드

Application은 다음 라이프사이클 메서드를 제공합니다.

### 로드 단계

```javascript
willLoad()   // load 시작 전
didLoad()    // load 완료 후
```

### 생성/소멸

```javascript
willCreate() // create 시작 전
didCreate()  // create 완료 후 ← 초기화 코드 작성
willDestroy() // destroy 시작 전
didDestroy() // destroy 완료 후
```

### 업데이트/렌더

```javascript
willUpdate(deltaTime, events, input)  // update 시작 전
didUpdate(deltaTime, events, input)   // update 완료 후

willRender(context, screen, screens)  // render 시작 전
didRender(context, screen, screens)   // render 완료 후
```

## 이벤트

메서드 오버라이드 대신 이벤트를 사용할 수도 있습니다.

```javascript
const app = new SceneApplication({
  mainScreen: 'main',
  events: {
    didCreate: () => {
      app.push(new TitleScene())
    }
  }
})
```

또는 인스턴스에서 등록:

```javascript
app.event.on('didCreate', () => {
  console.log('앱 생성됨')
})
```

## 다음

- [Scene](scene.md) - 씬 라이프사이클
- [Object](object.md) - 게임 오브젝트
