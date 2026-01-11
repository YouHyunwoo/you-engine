# Object

Object는 게임 내 모든 엔티티의 기본 클래스입니다. 플레이어, 적, 아이템 등 게임에 등장하는 모든 것을 Object로 표현합니다.

## 개요

```javascript
import { Object } from './you/object.js'

const player = new Object({
  name: 'player',
  tags: ['entity', 'controllable'],
  components: [new PlayerController()],
})
```

## 생성자 옵션

```javascript
new Object({
  name: '',              // 오브젝트 이름
  enable: true,          // 활성화 여부
  tags: [],              // 태그 배열
  components: [],        // 컴포넌트 배열
  objects: [],           // 자식 오브젝트 배열
  events: {},            // 이벤트 핸들러
})
```

## 속성

| 속성 | 설명 |
|------|------|
| `name` | 오브젝트 이름 |
| `tags` | 태그 Set |
| `components` | 컴포넌트 배열 |
| `objects` | 자식 오브젝트 배열 |
| `parent` | 부모 (Scene 또는 Object) |
| `root` | 최상위 부모 |
| `enable` | 활성화 여부 |
| `created` | 생성 완료 여부 |

## 계층 구조

Object는 다른 Object를 자식으로 가질 수 있습니다.

```javascript
const tank = new Object({
  name: 'tank',
  objects: [
    new Object({ name: 'body' }),
    new Object({ name: 'turret' }),
  ]
})

// 또는 동적으로 추가
tank.add(new Object({ name: 'wheel' }))
```

### 자식 오브젝트 관리

```javascript
// 추가
object.add(child)

// 제거
object.remove(child)

// 이름으로 찾기
const turret = tank.find('turret')
const wheels = tank.findAll('wheel')

// 태그로 찾기
const enemies = object.findByTags(['enemy'], ['boss'])
// ['enemy'] 또는 ['boss'] 태그를 가진 오브젝트
```

## 컴포넌트 시스템

Object는 Component를 통해 기능을 추가합니다.

```javascript
import { Component } from './you/component.js'

class HealthComponent extends Component {
  hp = 100

  damage(amount) {
    this.hp -= amount
    if (this.hp <= 0) {
      this.object.destroy()
    }
  }
}

const enemy = new Object({
  components: [new HealthComponent()]
})

// 컴포넌트 찾기
const health = enemy.findComponent(HealthComponent)
health.damage(30)
```

### 컴포넌트 관리

```javascript
// 추가
object.addComponent(new SomeComponent())

// 제거
object.removeComponent(component)

// 찾기
const comp = object.findComponent(ComponentType)
const comps = object.findAllComponent(ComponentType)

// 필수 컴포넌트 (없으면 에러)
const required = object.findComponent(RequiredType, true)
```

## 라이프사이클

### 상태

```
INSTANTIATED → CREATED → DESTROYING → DESTROYED
```

| 상태 | 설명 |
|------|------|
| `INSTANTIATED` | 생성자 호출 직후 |
| `CREATED` | create() 완료 후, 게임 루프 참여 |
| `DESTROYING` | destroy() 진행 중 |
| `DESTROYED` | 소멸 완료 |

### 라이프사이클 메서드

```javascript
class Player extends Object {
  willCreate() { /* 초기화 전 */ }
  didCreate() { /* 초기화 후 - 설정 코드 */ }

  willDestroy() { /* 소멸 전 - 정리 코드 */ }
  didDestroy() { /* 소멸 후 */ }

  willUpdate(deltaTime, events, input) { /* 업데이트 전 */ }
  didUpdate(deltaTime, events, input) { /* 업데이트 후 */ }

  willRender(context, screen, screens) { /* 렌더 전 */ }
  didRender(context, screen, screens) { /* 렌더 후 */ }
}
```

## 활성화/비활성화

```javascript
// 비활성화 (update/render 호출 안 됨)
object.enable = false

// 활성화
object.enable = true

// 이벤트 훅
class Player extends Object {
  willBeEnabled() { }
  didBeEnabled() { }
  willBeDisabled() { }
  didBeDisabled() { }
}
```

## 소멸

```javascript
// 오브젝트 소멸
object.destroy()
```

destroy() 호출 시:
1. enable이 false로 설정됨
2. 모든 컴포넌트의 destroy() 호출
3. 모든 자식 오브젝트의 destroy() 호출
4. 부모에서 자동으로 제거됨

## 태그

태그로 오브젝트를 분류하고 검색할 수 있습니다.

```javascript
const enemy = new Object({
  tags: ['enemy', 'flying']
})

// 태그 확인
enemy.tags.has('enemy')  // true

// 태그 추가/제거
enemy.tags.add('boss')
enemy.tags.delete('flying')
```

## 다음

- [Component](component.md) - 컴포넌트 작성법
- [Scene](scene.md) - 씬에서 오브젝트 관리
