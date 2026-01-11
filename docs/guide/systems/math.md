# Math

벡터 연산, 지오메트리, 랜덤 유틸리티입니다.

## Vector

Array 프로토타입을 확장하여 배열을 벡터로 사용합니다.

```javascript
import './you/math/vector.js'

const a = [10, 20]
const b = [5, 10]

const c = a.add(b)  // [15, 30]
```

### 연산

```javascript
// 사칙연산 (벡터끼리 또는 스칼라와)
a.add(b)    // [a[0]+b[0], a[1]+b[1]]
a.sub(b)    // [a[0]-b[0], a[1]-b[1]]
a.mul(b)    // [a[0]*b[0], a[1]*b[1]]
a.div(b)    // [a[0]/b[0], a[1]/b[1]]

a.add(5)    // [a[0]+5, a[1]+5]
a.mul(2)    // [a[0]*2, a[1]*2]

// 내적
a.dot(b)    // a[0]*b[0] + a[1]*b[1]

// 비교
a.equals(b) // a[0]===b[0] && a[1]===b[1]
```

### 속성

```javascript
// 부호 반전
a.negate    // [-a[0], -a[1]]

// 크기 (길이)
a.magnitude // Math.sqrt(a[0]**2 + a[1]**2)

// 정규화
a.normalize() // 길이가 1인 벡터
```

### 유틸리티

```javascript
// 0으로 채워진 배열
Array.zeros(3)      // [0, 0, 0]
Array.zeros(2, 3)   // [[0, 0], [0, 0], [0, 0]]

// 반복
Array.repeat(3, 1)  // [1, 1, 1]
Array.repeat(3, () => Math.random())  // 랜덤 3개

// 범위 (제너레이터)
[...Array.range(5)]       // [0, 1, 2, 3, 4]
[...Array.range(2, 5)]    // [2, 3, 4]
[...Array.range(0, 10, 2)] // [0, 2, 4, 6, 8]

// 랜덤 선택
[1, 2, 3, 4, 5].choice()     // 하나 선택
[1, 2, 3, 4, 5].choice(3)    // 3개 선택 (중복 없음)
```

### 사용 예시

```javascript
// 플레이어를 향한 방향 벡터
const direction = playerPos.sub(enemyPos).normalize()

// 이동
enemy.position = enemy.position.add(direction.mul(speed * deltaTime))

// 거리 계산
const distance = playerPos.sub(enemyPos).magnitude
```

## Geometry

영역(AABB) 관련 연산입니다.

```javascript
import './you/math/geometry.js'
```

### 영역 형식

```javascript
// 2D: [x, y, width, height]
const area = [100, 100, 50, 50]

// 3D: [x, y, z, width, height, depth]
const cube = [0, 0, 0, 10, 10, 10]
```

### 포함 검사

```javascript
// 점이 영역 안에 있는지
const area = [0, 0, 100, 100]
const point = [50, 50]
area.contains(point)  // true

// 영역이 영역 안에 있는지
const inner = [10, 10, 20, 20]
area.contains(inner)  // true
```

### 충돌 검사

```javascript
const a = [0, 0, 50, 50]
const b = [30, 30, 50, 50]
a.intersects(b)  // true (겹침)

const c = [100, 100, 50, 50]
a.intersects(c)  // false (안 겹침)
```

### 중심점

```javascript
const area = [100, 100, 50, 50]
area.center2d  // [125, 125]

const cube = [0, 0, 0, 10, 10, 10]
cube.center3d  // [5, 5, 5]
```

### 영역 조작

```javascript
// 클리핑: 점을 영역 안으로 제한
const point = [150, 150]
const area = [0, 0, 100, 100]
point.clip(area)  // [100, 100]

// 확대
const area = [50, 50, 100, 100]
area.enlarge([10, 10])  // [45, 45, 110, 110]

// 축소
area.shrink([10, 10])   // [55, 55, 90, 90]
```

### 충돌 처리 예시

```javascript
class Collider extends Component {
  size = [32, 32]

  get area() {
    const [x, y] = this.object.position
    return [x, y, ...this.size]
  }

  isColliding(other) {
    return this.area.intersects(other.area)
  }

  containsPoint(point) {
    return this.area.contains(point)
  }
}
```

## Random

랜덤 유틸리티입니다.

```javascript
import { Random } from './you/math/random.js'
```

### 메서드

```javascript
// 범위 내 랜덤 (start 이상 end 미만)
Random.range(0, 100)    // 0 ~ 99.999...
Random.range(-1, 1)     // -1 ~ 0.999...

// 랜덤 배열
Random.repeat(3)        // [0.xxx, 0.xxx, 0.xxx]

// 랜덤 색상
Random.color()          // 'rgba(123, 45, 67, 1)'
Random.color(true)      // 'rgba(123, 45, 67, 0.xxx)' (투명도 포함)
```

### 사용 예시

```javascript
// 랜덤 위치에 적 생성
const x = Random.range(0, screenWidth)
const y = Random.range(0, screenHeight)
const enemy = new Enemy({ position: [x, y] })

// 랜덤 색상 파티클
const color = Random.color()

// 랜덤 방향
const angle = Random.range(0, Math.PI * 2)
const direction = [Math.cos(angle), Math.sin(angle)]
```

## 다음

- [UI](ui.md) - UI 시스템
- [Component](../core/component.md) - 수학 활용 예시
