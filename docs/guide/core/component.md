# Component

Component는 Object에 기능을 추가하는 단위입니다. 이동, 렌더링, 충돌 처리 등을 Component로 구현합니다.

## 개요

```javascript
import { Component } from './you/component.js'

class MovementComponent extends Component {
  speed = 100

  didUpdate(deltaTime, events, input) {
    if (input.isKeyDown('ArrowRight')) {
      this.object.position[0] += this.speed * deltaTime
    }
  }
}
```

## 생성자 옵션

```javascript
new Component({
  enable: true,   // 활성화 여부
  events: {},     // 이벤트 핸들러
})
```

## 속성

| 속성 | 설명 |
|------|------|
| `object` | 소속된 Object |
| `enable` | 활성화 여부 |

## Object에 부착

```javascript
// 생성자에서
const player = new Object({
  components: [
    new MovementComponent(),
    new RenderComponent(),
  ]
})

// 동적으로 추가
player.addComponent(new HealthComponent())

// 제거
player.removeComponent(component)
```

## 라이프사이클

Component는 Object의 라이프사이클에 따라 동작합니다.

```javascript
class MyComponent extends Component {
  // 생성/소멸
  willCreate() { }
  didCreate() { /* 초기화 */ }
  willDestroy() { /* 정리 */ }
  didDestroy() { }

  // 업데이트 (매 프레임)
  willUpdate(deltaTime, events, input) { }
  didUpdate(deltaTime, events, input) { /* 로직 */ }

  // 렌더링 (매 프레임)
  willRender(context, screen, screens) { }
  didRender(context, screen, screens) { /* 그리기 */ }

  // 활성화
  willBeEnabled() { }
  didBeEnabled() { }
  willBeDisabled() { }
  didBeDisabled() { }
}
```

### 호출 순서

1. Object의 willUpdate
2. 각 Component의 update (순서대로)
3. 각 자식 Object의 update
4. Object의 didUpdate

## 다른 컴포넌트 접근

같은 Object의 다른 Component에 접근할 수 있습니다.

```javascript
class AttackComponent extends Component {
  attack() {
    // 같은 오브젝트의 다른 컴포넌트 찾기
    const health = this.object.findComponent(HealthComponent)
    if (health) {
      health.heal(10)
    }
  }
}
```

## 예제: 스프라이트 렌더러

```javascript
import { Component } from './you/component.js'
import { Sprite } from './you/graphics/sprite.js'

class SpriteRenderer extends Component {
  sprite = null

  constructor({ sprite, ...options } = {}) {
    super(options)
    this.sprite = sprite
  }

  didRender(context) {
    if (!this.sprite) return

    const [x, y] = this.object.position
    this.sprite.render(context, x, y)
  }
}

// 사용
const enemy = new Object({
  position: [100, 100],
  components: [
    new SpriteRenderer({ sprite: enemySprite })
  ]
})
```

## 예제: 플레이어 컨트롤러

```javascript
class PlayerController extends Component {
  speed = 200

  didUpdate(deltaTime, events, input) {
    const pos = this.object.position
    const velocity = [0, 0]

    if (input.isKeyDown('ArrowLeft')) velocity[0] -= 1
    if (input.isKeyDown('ArrowRight')) velocity[0] += 1
    if (input.isKeyDown('ArrowUp')) velocity[1] -= 1
    if (input.isKeyDown('ArrowDown')) velocity[1] += 1

    // 정규화
    const len = Math.sqrt(velocity[0]**2 + velocity[1]**2)
    if (len > 0) {
      pos[0] += (velocity[0] / len) * this.speed * deltaTime
      pos[1] += (velocity[1] / len) * this.speed * deltaTime
    }
  }
}
```

## 예제: 충돌 처리

```javascript
class Collider extends Component {
  size = [32, 32]

  checkCollision(other) {
    const [x1, y1] = this.object.position
    const [w1, h1] = this.size
    const [x2, y2] = other.object.position
    const [w2, h2] = other.size

    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2
  }
}
```

## 활성화/비활성화

```javascript
// 컴포넌트 비활성화 (update/render 호출 안 됨)
component.enable = false

// 활성화
component.enable = true
```

Object가 비활성화되면 모든 Component도 update/render가 호출되지 않습니다.

## 다음

- [Object](object.md) - 오브젝트와 컴포넌트 관계
- [Graphics](../systems/graphics.md) - 렌더링 관련 클래스
