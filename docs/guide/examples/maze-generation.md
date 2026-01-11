# Maze Generation 예제

DFS(깊이 우선 탐색) 알고리즘으로 미로를 생성하는 시각화 예제입니다.

## 파일 구조

```
examples/maze_generation/
├── index.html          # HTML 진입점
└── scripts/
    ├── run.js          # 엔진 초기화
    ├── mazeGeneration.js  # Application
    └── maze.js         # 미로 생성 로직
```

## 참고 포인트

### 1. 엔진 초기화

**파일:** `scripts/run.js`

```javascript
import { You } from "../../../you/you.js";
import { MazeGeneration } from "./mazeGeneration.js";

const configurations = {
  screens: {
    default: {
      canvas: document.querySelector('canvas'),
      size: [800, 800],
    }
  },
  applications: [
    new MazeGeneration({ mainScreen: 'default' }),
  ]
}

You.run(configurations);
```

간단한 설정으로 엔진을 시작합니다.

### 2. 로직 분리

게임 로직(Maze)과 엔진 연동(MazeGeneration)을 분리한 구조입니다.

**Maze 클래스** - 순수 미로 생성 로직

```javascript
export class Maze {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = [];  // 2D 배열
    this.generator = null;  // 현재 위치
    this.trace = [];  // 백트래킹용 스택
    this.finished = false;
  }

  spawn(x, y) { ... }
  travel() { ... }
  render(context, tileSize) { ... }
}
```

**MazeGeneration 클래스** - 엔진 연동

```javascript
export class MazeGeneration extends Application {
  constructor({ ... }) {
    super({ ... });
    this.maze = new Maze(20, 20);
    this.maze.spawn(0, 0);
    this.progress = 0;
  }

  didUpdate(deltaTime) {
    if (this.maze.finished) return;
    // 프레임 속도 제어
    if (this.progress > 1) {
      this.maze.travel();
      this.progress -= 1;
    }
    this.progress += deltaTime * 100;
  }

  didRender(context) {
    const tileSize = [ ... ];
    this.maze.render(context, tileSize);
  }
}
```

### 3. DFS 미로 생성 알고리즘

```javascript
const DIRECTION = [
  [-1, 0],  // 좌
  [+1, 0],  // 우
  [0, -1],  // 상
  [0, +1],  // 하
];

travel() {
  // 1. 이동 가능한 방향 찾기
  let candidates = this.findCandidates();

  // 2. 막다른 길이면 백트래킹
  while (candidates.length === 0 && !this.finished) {
    this.backtrack();
    candidates = this.findCandidates();
  }

  // 3. 랜덤 방향으로 이동
  if (candidates.length > 0) {
    const direction = this.chooseDirection(candidates);
    this.move(direction);
  }
}

findCandidates() {
  const candidates = [];
  for (let i = 0; i < 4; i++) {
    const [dx, dy] = DIRECTION[i];
    const [x, y] = [this.generator[0] + dx, this.generator[1] + dy];
    if (this.isMoveable(x, y)) {
      candidates.push(i);
    }
  }
  return candidates;
}

isMoveable(x, y) {
  return this.map?.[y]?.[x] === 0;  // 방문하지 않은 셀
}
```

### 4. 벽 상태를 비트마스크로 표현

```javascript
move(direction) {
  // 현재 위치 저장 (백트래킹용)
  this.trace.push([...this.generator]);

  // 비트마스크로 벽 상태 기록
  // 0001 (1) = 좌측 열림
  // 0010 (2) = 우측 열림
  // 0100 (4) = 상단 열림
  // 1000 (8) = 하단 열림
  this.map[this.generator[1]][this.generator[0]] += 2 ** direction;

  // 이동
  const [dx, dy] = DIRECTION[direction];
  this.generator[0] += dx;
  this.generator[1] += dy;
}
```

### 5. 백트래킹

```javascript
backtrack() {
  if (this.trace.length === 0) {
    this.finished = true;
    return;
  }

  // 막다른 길 표시
  if (this.map[this.generator[1]][this.generator[0]] === 0) {
    this.map[this.generator[1]][this.generator[0]] = 16;
  }

  // 이전 위치로 복귀
  this.generator = this.trace.pop();
}
```

### 6. 애니메이션 속도 제어

```javascript
didUpdate(deltaTime, events, input) {
  if (this.maze.finished) {
    return;
  }

  // progress가 1 이상일 때만 한 스텝 진행
  if (this.progress > 1) {
    this.maze.travel();
    this.progress -= 1;
  }

  // deltaTime * 100 = 초당 100스텝
  this.progress += deltaTime * 100;
}
```

- `deltaTime`을 누적하여 속도 제어
- 값을 조절하여 애니메이션 속도 변경 가능

### 7. 그리드 렌더링

```javascript
render(context, tileSize=[10, 10]) {
  const borderSize = [1, 1];
  const tileSizeWithoutBorder = [
    tileSize[0] - borderSize[0],
    tileSize[1] - borderSize[1]
  ];

  for (let r = 0; r < this.map.length; r++) {
    for (let c = 0; c < this.map[r].length; c++) {
      const v = this.map[r][c];

      // 셀 배경
      context.fillStyle = v === 0 ? 'black' : 'white';
      context.fillRect(
        c * tileSize[0], r * tileSize[1],
        ...tileSizeWithoutBorder
      );

      // 비트마스크로 벽 렌더링
      if ((v & 1) === 1) { /* 좌측 벽 열림 */ }
      if ((v & 2) === 2) { /* 우측 벽 열림 */ }
      if ((v & 4) === 4) { /* 상단 벽 열림 */ }
      if ((v & 8) === 8) { /* 하단 벽 열림 */ }
    }
  }

  // 현재 생성기 위치 표시
  if (this.generator) {
    context.fillStyle = 'rgba(0, 255, 0, 0.5)';
    context.fillRect(
      this.generator[0] * tileSize[0],
      this.generator[1] * tileSize[1],
      ...tileSizeWithoutBorder
    );
  }
}
```

- 타일 기반 그리드 렌더링
- 비트 연산으로 벽 상태 확인
- 현재 위치를 녹색으로 표시

### 8. 동적 타일 크기 계산

```javascript
didRender(context, screens) {
  const tileSize = [
    Math.floor(context.canvas.width / this.maze.width),
    Math.floor(context.canvas.height / this.maze.height),
  ];

  this.maze.render(context, tileSize);
}
```

- 캔버스 크기에 맞춰 타일 크기 자동 계산
- 다양한 화면 크기에 대응

## 학습 포인트

| 주제 | 이 예제에서 배울 점 |
|------|---------------------|
| 로직 분리 | 게임 로직과 엔진 연동 분리 |
| 애니메이션 | deltaTime으로 속도 제어 |
| 그리드 렌더링 | 타일 기반 2D 맵 표시 |
| 비트마스크 | 상태를 비트로 효율적 저장 |
| 알고리즘 시각화 | DFS 과정을 단계별로 표시 |

## 다음

- [Defense](defense.md) - 디펜스 게임 예제
- [Application](../core/application.md) - Application 클래스 상세
