# Defense 게임 예제

타워 디펜스 스타일의 서바이벌 게임입니다. 중앙의 플레이어가 자동으로 범위 내 적을 공격하며, 적에게 닿으면 게임이 종료됩니다.

## 파일 구조

```
examples/defense/
├── index.html          # HTML 진입점
├── scripts/
│   ├── run.js          # 엔진 초기화
│   └── game.js         # 게임 로직
└── styles/
    ├── base.css
    └── canvas.css
```

## 참고 포인트

### 1. 엔진 초기화

**파일:** `scripts/run.js`

```javascript
import { You } from "../../../you/you.js";
import { DefenseGame } from "./game.js";

const configurations = {
  screens: {
    default: {
      canvas: document.querySelector('canvas'),
      size: [900, 600],
    },
  },
  applications: [
    new DefenseGame({ mainScreen: 'default' }),
  ],
};

You.run(configurations);
```

- `You.run()`으로 엔진 시작
- `screens`에 canvas와 크기 지정
- `applications`에 게임 인스턴스 등록

### 2. Application 상속

**파일:** `scripts/game.js`

```javascript
import { Application } from "../../../you/application.js";

export class DefenseGame extends Application {
  constructor({ events = {}, mainScreen = null } = {}) {
    super({ events, mainScreen });
    // 게임 상태 초기화
    this.player = { ... };
    this.monsters = [];
    // ...
  }

  didCreate() {
    this.reset(false);
  }

  didUpdate(deltaTime, events) {
    // 게임 로직
  }

  didRender(context) {
    // 렌더링
  }
}
```

이 예제는 Scene을 사용하지 않고 Application을 직접 상속합니다. 단순한 게임에서는 이 방식이 더 간결합니다.

### 3. 게임 상태 관리

```javascript
constructor({ ... }) {
  super({ ... });

  this.player = {
    position: [0, 0],
    radius: CONFIG.playerRadius,
    range: CONFIG.playerRange,
    // ...
  };

  this.monsters = [];
  this.beams = [];
  this.effects = [];
  this.score = 0;
  this.gold = 0;
  this.gameOver = false;
}

reset(keepGold = true) {
  const [w, h] = CONFIG.canvasSize;
  this.player.position = [w / 2, h / 2];
  this.monsters = [];
  // ...
}
```

- 게임 상태를 인스턴스 변수로 관리
- `reset()` 메서드로 상태 초기화
- 설정값은 `CONFIG` 객체로 분리

### 4. 게임 루프 (Update)

```javascript
didUpdate(deltaTime, events) {
  // 입력 처리
  this.handleInputs(events);
  if (this.showShop) { return; }

  // 시간 기반 로직
  this.timeAlive += deltaTime;
  this.spawnTimer += deltaTime;

  // 스폰 처리
  if (this.spawnTimer >= this.spawnInterval) {
    this.spawnMonster();
    this.spawnTimer = 0;
  }

  // 엔티티 업데이트
  for (const monster of this.monsters) {
    monster.position[0] += monster.velocity[0] * deltaTime;
    monster.position[1] += monster.velocity[1] * deltaTime;
  }

  // 자동 공격
  this.tryAutoFire();

  // 충돌 검사
  this.handleCollisions();
}
```

- `deltaTime`으로 프레임 독립적인 로직 구현
- 타이머 기반 스폰 시스템
- 상태에 따른 분기 처리

### 5. 입력 처리

```javascript
handleInputs(events) {
  if (!this.showShop) { return; }

  for (const ev of events) {
    if (ev.type !== 'keydown') { continue; }

    if (ev.key === 'r' || ev.key === 'R') {
      this.reroll();
    }
    if (ev.key === 'Enter') {
      this.startNextRound();
    }
    if (ev.key === '1') { this.pickUpgrade(0); }
    if (ev.key === '2') { this.pickUpgrade(1); }
    if (ev.key === '3') { this.pickUpgrade(2); }
  }
}
```

- `events` 배열에서 입력 이벤트 확인
- `ev.type`과 `ev.key`로 키 식별
- 이벤트 기반으로 일회성 입력 처리

### 6. 렌더링

```javascript
didRender(context) {
  const [w, h] = this.screen.size;

  // 배경
  context.fillStyle = '#0f172a';
  context.fillRect(0, 0, w, h);

  // 범위 표시
  context.strokeStyle = 'rgba(103, 232, 249, 0.25)';
  context.beginPath();
  context.arc(this.player.position[0], this.player.position[1],
              this.player.range, 0, Math.PI * 2);
  context.stroke();

  // 몬스터
  for (const monster of this.monsters) {
    context.fillStyle = monster.color;
    context.fillRect(
      monster.position[0] - monster.size / 2,
      monster.position[1] - monster.size / 2,
      monster.size, monster.size
    );
  }

  // 플레이어
  context.fillStyle = '#38bdf8';
  context.beginPath();
  context.arc(...this.player.position, this.player.radius, 0, Math.PI * 2);
  context.fill();

  // UI
  context.fillStyle = '#e5e7eb';
  context.font = '16px sans-serif';
  context.fillText(`Score: ${this.score}`, 16, 26);
}
```

- Canvas 2D API 직접 사용
- `context.save()`/`restore()`로 상태 관리
- 배경 → 이펙트 → 엔티티 → UI 순서로 렌더링

### 7. 충돌 처리

```javascript
function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.hypot(dx, dy);
}

handleCollisions() {
  const playerHitRadius = this.player.radius + CONFIG.monsterSize * 0.5;

  for (const monster of this.monsters) {
    const d = distance(monster.position, this.player.position);
    if (d <= playerHitRadius) {
      this.gameOver = true;
      this.showShop = true;
      break;
    }
  }
}
```

- 원형 충돌 감지 (거리 비교)
- 히트박스 = 플레이어 반경 + 몬스터 크기의 절반

### 8. 스폰 시스템

```javascript
spawnMonster() {
  const [w, h] = this.screen.size;
  const side = Math.floor(Math.random() * 4);

  // 화면 가장자리에서 스폰
  let x = 0, y = 0;
  if (side === 0) { x = -margin; y = randomRange(0, h); }
  else if (side === 1) { x = w + margin; y = randomRange(0, h); }
  // ...

  // 플레이어를 향하는 방향
  const [dx, dy] = [this.player.position[0] - x, this.player.position[1] - y];
  const [nx, ny] = normalize(dx, dy);

  // 몬스터 타입 가중치 선택
  const type = weightedChoice(MONSTER_TYPES);

  this.monsters.push({
    position: [x, y],
    velocity: [nx * speed, ny * speed],
    // ...
  });
}
```

- 화면 4면 중 랜덤 위치에서 스폰
- 플레이어를 향해 이동
- 가중치 기반 타입 선택

## 학습 포인트

| 주제 | 이 예제에서 배울 점 |
|------|---------------------|
| 엔진 초기화 | `You.run()` 설정 방법 |
| Application 사용 | Scene 없이 직접 Application 구현 |
| 게임 루프 | deltaTime 기반 업데이트 |
| 입력 처리 | 이벤트 배열에서 키 입력 확인 |
| 렌더링 | Canvas 2D API 활용 |
| 상태 관리 | 게임 상태 구조화 |
| 충돌 감지 | 원형 충돌 (거리 비교) |

## 다음

- [Maze Generation](maze-generation.md) - 미로 생성 예제
- [Application](../core/application.md) - Application 클래스 상세
