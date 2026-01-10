# 스프라이트 애니메이션 설계

**날짜:** 2026-01-11
**상태:** 확정

## 개요

스프라이트 시트에서 프레임 시퀀스를 재생하는 애니메이션 시스템.

## 파일 구조

```
you/graphics/
├── sprite.js              # 기존 (변경 없음)
├── sprite-animation.js    # SpriteAnimation
└── animated-sprite.js     # AnimatedSprite
```

## 프레임 정의 방식

### 1. 영역 배열 (자유 위치)

```javascript
frames: [
  [0, 0, 32, 32],     // [x, y, width, height]
  [32, 0, 32, 32],
  [64, 0, 32, 32],
  [96, 0, 32, 32],
]
```

### 2. 그리드 기반 (규칙적인 시트)

```javascript
grid: {
  cols: 4,           // 시트의 열 개수
  rows: 2,           // 시트의 행 개수 (선택)
  frameWidth: 32,    // 프레임 너비 (선택, 자동 계산)
  frameHeight: 32,   // 프레임 높이 (선택, 자동 계산)
  start: 0,          // 시작 프레임 인덱스
  count: 4,          // 프레임 개수
}
```

## SpriteAnimation 클래스 (sprite-animation.js)

기존 Sprite와 조합하여 사용하는 기본 애니메이션 클래스.

### 생성자 옵션

```javascript
new SpriteAnimation({
  sprite,            // Sprite 객체 (필수)
  frames,            // 영역 배열 (frames 또는 grid 중 하나 필수)
  grid,              // 그리드 옵션 (frames 또는 grid 중 하나 필수)
  fps: 12,           // 초당 프레임 (기본: 12)
  loop: true,        // 반복 여부 (기본: true)
})
```

### 메서드

```javascript
play()              // 재생 시작
pause()             // 일시 정지
stop()              // 정지 및 처음으로
update(deltaTime)   // 프레임 업데이트
render(context, x, y)  // 현재 프레임 렌더링
```

### 속성

```javascript
currentFrame        // 현재 프레임 인덱스 (읽기/쓰기)
playing             // 재생 중 여부 (읽기)
frameCount          // 총 프레임 수 (읽기)
```

### 이벤트

```javascript
animation.event.on('frame', (frameIndex) => {})  // 프레임 변경시
animation.event.on('finish', () => {})           // loop=false일 때 완료시
animation.event.on('loop', () => {})             // 루프 완료시
```

### 사용 예시

```javascript
import { Sprite } from './graphics/sprite.js'
import { SpriteAnimation } from './graphics/sprite-animation.js'

const sprite = new Sprite({ sheet: playerImage })
const walkAnim = new SpriteAnimation({
  sprite,
  grid: { cols: 4, start: 0, count: 4 },
  fps: 12,
  loop: true
})

// 게임 루프에서
walkAnim.play()
walkAnim.update(deltaTime)
walkAnim.render(context, player.x, player.y)
```

## AnimatedSprite 클래스 (animated-sprite.js)

여러 애니메이션을 하나의 클래스에서 관리하는 편의 클래스.

### 생성자 옵션

```javascript
new AnimatedSprite({
  sheet,             // Image 객체 (필수)
  scale: [1, 1],     // 스케일 (선택)
  anchor: [0, 0],    // 앵커 (선택)
  animations: {      // 애니메이션 정의 (필수)
    idle: {
      frames: [[0,0,32,32], ...],  // 또는 grid
      fps: 8,
      loop: true
    },
    walk: {
      grid: { cols: 4, start: 4, count: 4 },
      fps: 12
    },
    jump: {
      grid: { cols: 4, start: 8, count: 2 },
      fps: 10,
      loop: false
    }
  },
  default: 'idle'    // 기본 애니메이션 (선택)
})
```

### 메서드

```javascript
play(name)          // 특정 애니메이션 재생
pause()             // 일시 정지
stop()              // 정지
update(deltaTime)   // 업데이트
render(context, x, y)  // 렌더링
```

### 속성

```javascript
current             // 현재 애니메이션 이름 (읽기)
currentFrame        // 현재 프레임 인덱스 (읽기)
playing             // 재생 중 여부 (읽기)
```

### 이벤트

```javascript
sprite.event.on('change', (name) => {})     // 애니메이션 변경시
sprite.event.on('frame', (frameIndex) => {}) // 프레임 변경시
sprite.event.on('finish', (name) => {})     // 애니메이션 완료시
```

### 사용 예시

```javascript
import { Image } from './graphics/image.js'
import { AnimatedSprite } from './graphics/animated-sprite.js'

const player = new AnimatedSprite({
  sheet: new Image('player.png'),
  animations: {
    idle: { grid: { cols: 4, start: 0, count: 4 }, fps: 8 },
    walk: { grid: { cols: 4, start: 4, count: 4 }, fps: 12 },
    jump: { grid: { cols: 4, start: 8, count: 2 }, fps: 10, loop: false }
  },
  default: 'idle'
})

// 상태에 따라 애니메이션 변경
if (isMoving) {
  player.play('walk')
} else {
  player.play('idle')
}

// 게임 루프에서
player.update(deltaTime)
player.render(context, x, y)
```

## 기존 시스템과의 관계

- **Sprite**: 정적 이미지/영역 표시 (변경 없음)
- **SpriteAnimation**: Sprite + 프레임 시퀀스 재생
- **AnimatedSprite**: 여러 애니메이션을 가진 통합 클래스
- **Progress**: 내부적으로 시간 진행 관리에 활용 가능
