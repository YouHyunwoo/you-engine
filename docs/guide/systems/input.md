# Input

키보드와 마우스 입력을 처리하는 시스템입니다.

## 접근 방법

Input은 Engine을 통해 접근합니다.

```javascript
class MyScene extends Scene {
  didUpdate(deltaTime, events, input) {
    // update 메서드의 세 번째 인자로 전달됨
    if (input.keys.has('Space')) {
      this.jump()
    }
  }
}

// 또는 engine을 통해 접근
const input = this.application.engine.input
```

## 키보드 입력

### 현재 상태 확인

```javascript
// 키가 눌려있는지 확인
if (input.keys.has('ArrowRight')) {
  player.x += speed * deltaTime
}

if (input.keys.has('Space')) {
  this.shoot()
}
```

### 키 이름

표준 `KeyboardEvent.key` 값을 사용합니다.

| 키 | 이름 |
|----|------|
| 화살표 | 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight' |
| 스페이스 | 'Space' |
| 엔터 | 'Enter' |
| ESC | 'Escape' |
| Shift | 'Shift' |
| Control | 'Control' |
| Alt | 'Alt' |
| 문자 | 'a', 'b', ..., 'z' (소문자) |
| 숫자 | '0', '1', ..., '9' |

## 마우스 입력

### 현재 위치

```javascript
// 마우스 현재 위치 [x, y]
const [mx, my] = input.mouse
```

## 이벤트 기반 입력

매 프레임 발생한 이벤트를 확인할 수 있습니다.

```javascript
didUpdate(deltaTime, events, input) {
  for (const event of events) {
    if (event.type === 'keydown' && event.key === 'Space') {
      // 스페이스 키를 눌렀을 때 (한 번만 실행)
      this.jump()
    }
  }
}
```

### 이벤트 타입

| 타입 | 속성 | 설명 |
|------|------|------|
| `keydown` | `key` | 키 눌림 |
| `keyup` | `key` | 키 뗌 |
| `mousedown` | `position` | 마우스 버튼 눌림 |
| `mouseup` | `position` | 마우스 버튼 뗌 |
| `mousemove` | `position` | 마우스 이동 |
| `mousewheel` | `position`, `delta` | 마우스 휠 |

### 이벤트 사용 예시

```javascript
class GameScene extends Scene {
  didUpdate(deltaTime, events, input) {
    for (const event of events) {
      switch (event.type) {
        case 'keydown':
          if (event.key === 'Escape') {
            this.push(new PauseScene())
          }
          break

        case 'mousedown':
          this.shoot(event.position)
          break

        case 'mousewheel':
          this.camera.scale = this.camera.scale.add(event.delta * 0.001)
          break
      }
    }
  }
}
```

## 폴링 vs 이벤트

| 방식 | 용도 |
|------|------|
| 폴링 (`input.keys.has`) | 지속적인 입력 (이동, 누르고 있기) |
| 이벤트 | 일회성 입력 (점프, 발사, 메뉴 선택) |

```javascript
didUpdate(deltaTime, events, input) {
  // 폴링: 이동 (계속 누르고 있으면 계속 이동)
  if (input.keys.has('ArrowRight')) {
    this.x += 100 * deltaTime
  }

  // 이벤트: 점프 (눌렀을 때 한 번만)
  for (const event of events) {
    if (event.type === 'keydown' && event.key === 'Space') {
      this.jump()
    }
  }
}
```

## 포인터 잠금

FPS 게임 등에서 마우스 포인터를 잠글 수 있습니다.

```javascript
// 포인터 잠금
input.lockPointer()

// 잠금 해제
input.unlockPointer()
```

포인터가 잠기면 `mouselockmove` 이벤트가 발생합니다.

```javascript
didUpdate(deltaTime, events) {
  for (const event of events) {
    if (event.type === 'mouselockmove') {
      // 마우스 이동량
      this.rotateCamera(event.delta[0], event.delta[1])
    }
  }
}
```

## 다음

- [Math](math.md) - 벡터 연산
- [Scene](../core/scene.md) - 씬에서 입력 처리
