# Scene

Scene은 게임 화면 단위입니다. 타이틀, 게임 플레이, 결과 화면 등을 각각의 Scene으로 구현합니다.

## 개요

```javascript
import { Scene } from './you/scene.js'

class GameScene extends Scene {
  didCreate() {
    // 초기화
  }

  didUpdate(deltaTime) {
    // 게임 로직
  }

  didRender(context) {
    // 렌더링
  }
}
```

## 생성자 옵션

```javascript
new Scene({
  enable: true,  // 활성화 여부
  events: {      // 이벤트 핸들러
    didCreate: () => {},
  }
})
```

## 속성

| 속성 | 설명 |
|------|------|
| `application` | 소속된 SceneApplication |
| `objects` | 씬에 포함된 Object 배열 |
| `camera` | Camera 인스턴스 |
| `enable` | 활성화 여부 |
| `created` | 생성 완료 여부 |

## 라이프사이클

```
INSTANTIATED (new Scene())
      ↓
  create() 호출
      ↓
   CREATED
      ↓
[게임 루프]
├── update(deltaTime)
└── render(context)
      ↓
  destroy() 호출
      ↓
  DESTROYED
```

### 라이프사이클 메서드

```javascript
class GameScene extends Scene {
  // 생성
  willCreate() { /* create 시작 전 */ }
  didCreate() { /* create 완료 후 - 초기화 코드 */ }

  // 소멸
  willDestroy() { /* destroy 시작 전 */ }
  didDestroy() { /* destroy 완료 후 - 정리 코드 */ }

  // 업데이트
  willUpdate(deltaTime, events, input) { /* update 전 */ }
  didUpdate(deltaTime, events, input) { /* update 후 - 게임 로직 */ }

  // 렌더
  willRender(context, screen, screens) { /* render 전 */ }
  didRender(context, screen, screens) { /* render 후 - 렌더링 코드 */ }
}
```

## 오브젝트 관리

### 추가/제거

```javascript
class GameScene extends Scene {
  didCreate() {
    const player = new Object({ name: 'player' })
    this.add(player)  // 씬에 추가
  }

  removePlayer() {
    const player = this.find('player')
    this.remove(player)  // 씬에서 제거
  }
}
```

### 검색

```javascript
// 이름으로 찾기
const player = this.find('player')       // 첫 번째 매칭
const enemies = this.findAll('enemy')    // 모든 매칭
```

## 카메라

Scene은 자동으로 Camera를 생성합니다.

```javascript
class GameScene extends Scene {
  didUpdate(deltaTime) {
    // 카메라 이동
    this.camera.position = [playerX, playerY]

    // 카메라 줌
    this.camera.scale = [2, 2]  // 2배 확대
  }
}
```

카메라는 View 타입이 아닌 오브젝트에만 적용됩니다. UI는 카메라 영향을 받지 않습니다.

## 씬 전환

Scene 내에서 다른 씬으로 전환할 수 있습니다.

```javascript
class TitleScene extends Scene {
  didUpdate(deltaTime, events, input) {
    if (input.isKeyPressed('Enter')) {
      // 다른 씬 추가
      this.push(new GameScene())

      // 현재 씬 제거
      // this.pop()

      // 씬 교체 (pop + push)
      // this.transit(new GameScene())
    }
  }
}
```

## 렌더링 순서

1. 카메라 변환 적용
2. 일반 오브젝트 렌더링 (View 제외)
3. 카메라 변환 해제
4. View 오브젝트 렌더링 (UI)

```javascript
// 렌더링 순서 예시
this.add(new Enemy())     // 1. 카메라 영향 받음
this.add(new Player())    // 2. 카메라 영향 받음
this.add(new HUD())       // 3. View면 카메라 영향 안 받음
```

## 다음

- [Object](object.md) - 게임 오브젝트
- [Component](component.md) - 컴포넌트 시스템
