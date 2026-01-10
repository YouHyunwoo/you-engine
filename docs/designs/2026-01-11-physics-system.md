# 물리 시스템 설계

**날짜:** 2026-01-11
**상태:** 확정

## 개요

2D 물리 시뮬레이션 시스템. Rigidbody로 물리 속성을 정의하고, Collider로 충돌 영역을 정의하며, PhysicsWorld가 전체를 관리한다.

## 파일 구조

```
you/physics/
├── rigidbody.js       # Rigidbody 컴포넌트
├── collider.js        # Collider (Box, Circle, Polygon)
└── physics-world.js   # PhysicsWorld (전체 관리)
```

## Rigidbody 클래스 (rigidbody.js)

물리 속성을 정의하는 컴포넌트. Component를 상속.

### 생성자 옵션

```javascript
new Rigidbody({
  velocity: [0, 0],       // 속도 (px/s)
  acceleration: [0, 0],   // 가속도 (px/s^2)
  gravity: null,          // 개별 중력 (null이면 월드 중력 사용)
  mass: 1,                // 질량
  friction: 0.0,          // 마찰 계수 (0.0 ~ 1.0)
  bounce: 0.0,            // 반발 계수 (0.0 ~ 1.0)
  maxVelocity: null,      // 최대 속도 제한 (null이면 무제한)
})
```

### 메서드

```javascript
applyForce(force)         // 힘 적용 [fx, fy]
applyImpulse(impulse)     // 충격 적용 (즉시 속도 변화)
```

### 속성

```javascript
velocity                  // 현재 속도 (읽기/쓰기)
acceleration              // 현재 가속도 (읽기/쓰기)
mass                      // 질량 (읽기/쓰기)
friction                  // 마찰 계수 (읽기/쓰기)
bounce                    // 반발 계수 (읽기/쓰기)
```

### 사용 예시

```javascript
import { Rigidbody } from './physics/rigidbody.js'

const rb = new Rigidbody({
  mass: 1,
  friction: 0.1,
  bounce: 0.5
})

// 점프
rb.applyImpulse([0, -500])

// 지속적인 힘 (바람 등)
rb.applyForce([100, 0])
```

## Collider 클래스 (collider.js)

충돌 영역을 정의하는 컴포넌트. Component를 상속.

### Collider 타입

#### BoxCollider

```javascript
new BoxCollider({
  size: [32, 64],         // 너비, 높이
  offset: [0, 0],         // Object 위치 기준 오프셋
  type: 'dynamic',        // static, dynamic, kinematic, trigger
})
```

#### CircleCollider

```javascript
new CircleCollider({
  radius: 16,             // 반지름
  offset: [0, 0],         // Object 위치 기준 오프셋
  type: 'dynamic',
})
```

#### PolygonCollider

```javascript
new PolygonCollider({
  vertices: [             // 볼록 다각형 꼭짓점 (시계 방향)
    [0, 0],
    [32, 0],
    [32, 32],
    [16, 48],
    [0, 32]
  ],
  offset: [0, 0],
  type: 'dynamic',
})
```

### Body 타입

| 타입 | 설명 | 물리 영향 | 다른 것에 영향 |
|------|------|----------|---------------|
| `static` | 움직이지 않음 | X | O |
| `dynamic` | 물리 영향 받음 | O | O |
| `kinematic` | 코드로 움직임 | X | O |
| `trigger` | 충돌 감지만 | X | X |

### 이벤트

```javascript
// 물리 충돌 (static, dynamic, kinematic)
collider.event.on('collisionEnter', (other, contact) => {})
collider.event.on('collisionStay', (other, contact) => {})
collider.event.on('collisionExit', (other) => {})

// 트리거 (trigger 타입)
collider.event.on('triggerEnter', (other) => {})
collider.event.on('triggerExit', (other) => {})
```

### contact 객체

```javascript
{
  point: [x, y],          // 충돌 지점
  normal: [nx, ny],       // 충돌 법선 (밀어내는 방향)
  depth: number,          // 침투 깊이
}
```

## PhysicsWorld 클래스 (physics-world.js)

전체 물리 시뮬레이션을 관리.

### 생성자 옵션

```javascript
new PhysicsWorld({
  gravity: [0, 980],      // 월드 중력 (기본: 아래로 980px/s^2)
})
```

### 메서드

```javascript
add(collider)             // Collider 등록
remove(collider)          // Collider 제거
update(deltaTime)         // 물리 시뮬레이션 (매 프레임 호출)
raycast(origin, direction, maxDistance)  // 레이캐스트
```

### raycast 반환값

```javascript
{
  hit: true,              // 충돌 여부
  collider: Collider,     // 충돌한 Collider
  point: [x, y],          // 충돌 지점
  normal: [nx, ny],       // 충돌 법선
  distance: number,       // 거리
}
// 또는 { hit: false }
```

### 속성

```javascript
gravity                   // 월드 중력 (읽기/쓰기)
colliders                 // 등록된 Collider 목록 (읽기)
```

## 전체 사용 예시

```javascript
import { Object } from './object.js'
import { PhysicsWorld } from './physics/physics-world.js'
import { Rigidbody } from './physics/rigidbody.js'
import { BoxCollider, CircleCollider } from './physics/collider.js'

// 물리 월드 생성
const world = new PhysicsWorld({ gravity: [0, 980] })

// 플레이어 (동적)
const player = new Object({
  position: [100, 100],
  components: [
    new Rigidbody({ mass: 1, friction: 0.1, bounce: 0.2 }),
    new BoxCollider({ size: [32, 64], type: 'dynamic' })
  ]
})

// 바닥 (정적)
const ground = new Object({
  position: [0, 550],
  components: [
    new BoxCollider({ size: [800, 50], type: 'static' })
  ]
})

// 아이템 (트리거)
const coin = new Object({
  position: [300, 400],
  components: [
    new CircleCollider({ radius: 16, type: 'trigger' })
  ]
})

// 충돌 이벤트
coin.findComponent(CircleCollider).event.on('triggerEnter', (other) => {
  if (other.object === player) {
    console.log('코인 획득!')
    coin.destroy()
  }
})

// 월드에 등록
world.add(player.findComponent(BoxCollider))
world.add(ground.findComponent(BoxCollider))
world.add(coin.findComponent(CircleCollider))

// 게임 루프에서
function update(deltaTime) {
  world.update(deltaTime)
}
```

## 충돌 감지 알고리즘

| 조합 | 알고리즘 |
|------|----------|
| Box vs Box | AABB |
| Circle vs Circle | 거리 비교 |
| Box vs Circle | 최근접점 계산 |
| Polygon vs Polygon | SAT (Separating Axis Theorem) |
| Polygon vs Box | SAT |
| Polygon vs Circle | SAT + 최근접점 |

## 추후 추가 예정

- 충돌 레이어/마스크 (선택적 충돌)
- 관절/제약 (Joint, Constraint)
- 공간 분할 최적화 (QuadTree)

## 기존 시스템과의 관계

- **math/geometry.js**: 기존 AABB 충돌 함수 활용 가능
- **Component**: Rigidbody, Collider는 Component 상속
- **Object**: position 속성을 물리 시스템이 업데이트
- **Scene**: PhysicsWorld를 Scene에 연결하여 자동 update 가능
