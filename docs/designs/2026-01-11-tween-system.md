# 트위닝 시스템 설계

**날짜:** 2026-01-11
**상태:** 확정

## 개요

시작값에서 끝값까지 시간에 따라 부드럽게 변화시키는 트위닝 시스템.

## 파일 구조

```
you/animation/
├── easing.js          # 이징 함수 18개
├── tween.js           # Tween (Task 상속)
└── tween-component.js # TweenComponent
```

## 이징 함수 (easing.js)

총 18개 이징 함수 제공:

| 타입 | 변형 | 설명 |
|------|------|------|
| linear | - | 선형 |
| Quad | In/Out/InOut | 2차 곡선 |
| Cubic | In/Out/InOut | 3차 곡선 |
| Sine | In/Out/InOut | 사인 곡선 |
| Elastic | In/Out/InOut | 탄성 효과 |
| Bounce | In/Out/InOut | 바운스 효과 |
| Back | In/Out/InOut | 오버슈트 효과 |

```javascript
// 사용 예시
import { Easing } from './animation/easing.js'

Easing.linear(t)
Easing.easeInQuad(t)
Easing.easeOutQuad(t)
Easing.easeInOutQuad(t)
// ...
```

## Tween 클래스 (tween.js)

`Task`를 상속하여 `Procedure`와 호환.

### 생성자 옵션

```javascript
new Tween({
  target,           // 대상 객체 (필수)
  property,         // 속성명 문자열 (필수)
  from,             // 시작값 (생략시 현재값)
  to,               // 끝값 (필수)
  duration: 1000,   // 밀리초 (기본: 1000)
  easing: Easing.linear,  // 이징 함수 (기본: linear)
  onUpdate,         // 업데이트 콜백 (선택)
  onFinish,         // 완료 콜백 (선택)
})
```

### 사용 예시

```javascript
import { Tween } from './animation/tween.js'
import { Easing } from './animation/easing.js'
import { Procedure } from './utilities/procedure.js'

// 단일 트윈
const tween = new Tween({
  target: player,
  property: 'x',
  to: 100,
  duration: 500,
  easing: Easing.easeOutQuad
})

// Procedure와 조합 (순차)
new Procedure([
  new Tween({ target: box, property: 'x', to: 100, duration: 500 }),
  new Tween({ target: box, property: 'y', to: 200, duration: 500 }),
])

// Procedure와 조합 (병렬)
new Procedure([
  [
    new Tween({ target: box, property: 'x', to: 100, duration: 300 }),
    new Tween({ target: box, property: 'y', to: 200, duration: 300 }),
  ]
])
```

## TweenComponent 클래스 (tween-component.js)

`Component`를 상속하여 `Object`에 부착 가능.

### 메서드

```javascript
// 트윈 실행
run({
  property,         // 속성명 (필수)
  from,             // 시작값 (생략시 현재값)
  to,               // 끝값 (필수)
  duration: 1000,   // 밀리초
  easing: Easing.linear,
  onUpdate,
  onFinish,
})

// 현재 트윈 정지
stop()

// 모든 트윈 정지
stopAll()
```

### 사용 예시

```javascript
import { Object } from './object.js'
import { TweenComponent } from './animation/tween-component.js'
import { Easing } from './animation/easing.js'

const player = new Object({
  position: [0, 0],
  components: [
    new TweenComponent()
  ]
})

// 나중에 애니메이션 실행
const tweenComp = player.findComponent(TweenComponent)
tweenComp.run({
  property: 'position',
  to: [100, 200],
  duration: 1000,
  easing: Easing.easeOutQuad,
  onFinish: () => console.log('done!')
})
```

## 값 보간

### 지원 타입

| 타입 | 예시 | 보간 방식 |
|------|------|----------|
| 숫자 | `x: 100` | 선형 보간 |
| 배열 | `position: [100, 200]` | 요소별 보간 |

### 보간 공식

```javascript
// 숫자
value = from + (to - from) * easedProgress

// 배열 (벡터)
value = from.map((v, i) => v + (to[i] - v) * easedProgress)
```

### 추후 지원 예정

- 색상 문자열 (`'rgba(255,0,0,1)'`)

## 기존 시스템과의 관계

- **Progress**: 0→1 진행률 관리 (범용)
- **Tween**: Progress 개념 활용 + 값 보간 + 이징
- **Task**: Tween의 부모 클래스, Procedure 호환
- **Component**: TweenComponent의 부모 클래스
