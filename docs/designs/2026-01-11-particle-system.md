# 파티클 시스템 설계

**날짜:** 2026-01-11
**상태:** 확정

## 개요

폭발, 연기, 불꽃, 비, 눈 같은 시각 효과를 위한 파티클 시스템. Emitter가 파티클을 생성하고 관리한다.

## 파일 구조

```
you/particle/
├── particle.js          # Particle (개별 입자)
├── emitter.js           # ParticleEmitter
└── particle-system.js   # ParticleSystem (여러 이미터 관리, 선택)
```

## Particle 클래스 (particle.js)

개별 입자. 내부적으로 사용되며 직접 생성하지 않음.

### 속성

```javascript
{
  position: [x, y],       // 현재 위치
  velocity: [vx, vy],     // 속도
  lifetime: number,       // 총 수명 (초)
  age: number,            // 현재 나이 (초)
  progress: number,       // 진행률 (0~1, age/lifetime)
  size: number,           // 현재 크기
  alpha: number,          // 현재 투명도
  color: string,          // 현재 색상
  rotation: number,       // 회전 (라디안)
  alive: boolean,         // 생존 여부
}
```

## ParticleEmitter 클래스 (emitter.js)

파티클을 생성하고 관리하는 메인 클래스.

### 생성자 옵션

```javascript
new ParticleEmitter({
  // === 위치 ===
  position: [0, 0],           // 이미터 위치

  // === 생성 ===
  rate: 10,                   // 초당 생성 개수 (0이면 burst만 사용)
  maxParticles: 100,          // 최대 파티클 수
  duration: Infinity,         // 이미터 지속 시간 (초)

  // === 렌더링 ===
  shape: 'circle',            // 'circle', 'rect', 'image'
  image: null,                // shape가 'image'일 때 Image/Sprite 객체
  blendMode: 'source-over',   // Canvas blend mode ('lighter' for glow)

  // === 파티클 초기값 (범위 또는 고정값) ===
  lifetime: [0.5, 1.5],       // 수명 (초)
  speed: [50, 100],           // 초기 속도 (px/s)
  direction: [0, 360],        // 방출 각도 (도)
  spread: 0,                  // 방출 영역 반경
  rotation: [0, 0],           // 초기 회전
  rotationSpeed: [0, 0],      // 회전 속도 (도/s)

  // === 시간에 따른 변화 (이징 지원) ===
  size: { from: 8, to: 0 },
  // 또는 이징 포함: { from: 8, to: 0, easing: Easing.easeOutQuad }

  alpha: { from: 1, to: 0 },
  // 또는: { from: 1, to: 0, easing: Easing.easeIn }

  color: { from: '#ff0000', to: '#ffff00' },
  // 색상은 RGB 채널별 선형 보간

  scale: { from: 1, to: 1 },  // 이미지 스케일 (shape: 'image'일 때)

  // === 물리 ===
  gravity: [0, 0],            // 중력 (px/s^2)
  friction: 0,                // 마찰 (0~1)
})
```

### 메서드

```javascript
start()                       // 연속 생성 시작
stop()                        // 생성 중지 (기존 파티클은 유지)
burst(count)                  // 한 번에 count개 생성
clear()                       // 모든 파티클 즉시 제거
reset()                       // 이미터 초기화 (clear + 상태 리셋)

update(deltaTime)             // 파티클 업데이트
render(context)               // 파티클 렌더링

// 런타임 속성 변경
setPosition(x, y)
setRate(rate)
```

### 속성

```javascript
position                      // 이미터 위치 (읽기/쓰기)
particleCount                 // 현재 파티클 수 (읽기)
running                       // 생성 중 여부 (읽기)
```

### 이벤트

```javascript
emitter.event.on('start', () => {})
emitter.event.on('stop', () => {})
emitter.event.on('particleSpawn', (particle) => {})
emitter.event.on('particleDeath', (particle) => {})
emitter.event.on('empty', () => {})       // 모든 파티클 소멸 시
emitter.event.on('complete', () => {})    // duration 끝 + empty
```

## ParticleSystem 클래스 (particle-system.js)

여러 이미터를 관리하는 편의 클래스 (선택적 사용).

### 사용 예시

```javascript
const system = new ParticleSystem()

system.add('explosion', new ParticleEmitter({ ... }))
system.add('smoke', new ParticleEmitter({ ... }))

system.play('explosion', [100, 200])  // 특정 위치에서 재생
system.update(deltaTime)
system.render(context)
```

## 사용 예시

### 폭발 효과

```javascript
import { ParticleEmitter } from './particle/emitter.js'
import { Easing } from './animation/easing.js'

const explosion = new ParticleEmitter({
  position: [400, 300],
  rate: 0,                    // burst만 사용
  maxParticles: 50,

  shape: 'circle',
  lifetime: [0.3, 0.8],
  speed: [100, 300],
  direction: [0, 360],

  size: { from: 12, to: 0, easing: Easing.easeOutQuad },
  alpha: { from: 1, to: 0, easing: Easing.easeIn },
  color: { from: '#ffff00', to: '#ff0000' },

  gravity: [0, 200],
})

// 폭발!
explosion.burst(50)
```

### 연기 효과

```javascript
const smoke = new ParticleEmitter({
  position: [400, 500],
  rate: 20,
  maxParticles: 100,

  shape: 'circle',
  lifetime: [1, 2],
  speed: [20, 50],
  direction: [250, 290],      // 위쪽으로

  size: { from: 8, to: 32, easing: Easing.easeOut },
  alpha: { from: 0.5, to: 0, easing: Easing.easeIn },
  color: { from: '#888888', to: '#cccccc' },

  gravity: [0, -30],          // 위로 떠오름
})

smoke.start()
```

### 불꽃 효과 (이미지 사용)

```javascript
import { Image } from './graphics/image.js'

const sparkImage = new Image('spark.png')

const sparks = new ParticleEmitter({
  position: [400, 300],
  rate: 30,
  maxParticles: 200,

  shape: 'image',
  image: sparkImage,
  blendMode: 'lighter',       // 빛나는 효과

  lifetime: [0.5, 1],
  speed: [50, 150],
  direction: [0, 360],
  rotationSpeed: [-180, 180],

  scale: { from: 1, to: 0.2 },
  alpha: { from: 1, to: 0 },
})
```

### 비 효과

```javascript
const rain = new ParticleEmitter({
  position: [400, 0],         // 화면 상단
  spread: 400,                // 넓은 영역에서 생성
  rate: 100,
  maxParticles: 500,

  shape: 'rect',
  lifetime: [0.5, 1],
  speed: [400, 600],
  direction: [85, 95],        // 거의 아래로

  size: { from: 2, to: 2 },   // 고정 크기
  alpha: { from: 0.6, to: 0.3 },
  color: { from: '#aaddff', to: '#aaddff' },
})
```

## 값 보간 방식

### 범위 값 (초기값 랜덤)

```javascript
lifetime: [0.5, 1.5]          // 0.5 ~ 1.5 사이 랜덤
speed: 100                    // 고정값
direction: [0, 360]           // 0 ~ 360 사이 랜덤
```

### 시간 변화 (이징 지원)

```javascript
// 기본 (선형)
size: { from: 8, to: 0 }

// 이징 적용
size: { from: 8, to: 0, easing: Easing.easeOutQuad }

// 색상 (RGB 채널별 보간)
color: { from: '#ff0000', to: '#ffff00' }
```

### 보간 공식

```javascript
// progress = particle.age / particle.lifetime (0~1)
// easedProgress = easing(progress)

currentValue = from + (to - from) * easedProgress
```

## 성능 고려사항

- **오브젝트 풀링**: 파티클 재사용으로 GC 최소화
- **배치 렌더링**: 같은 설정의 파티클 일괄 렌더링
- **maxParticles**: 적절한 제한으로 과부하 방지
- **영역 컬링**: 화면 밖 파티클 업데이트 스킵 (선택)

## 기존 시스템과의 관계

- **Easing**: 트위닝 시스템의 이징 함수 재사용
- **Image/Sprite**: shape: 'image'에서 기존 그래픽 클래스 사용
- **Component**: ParticleEmitter를 Component로 래핑하여 Object에 부착 가능
- **math/vector.js**: 벡터 연산 활용
