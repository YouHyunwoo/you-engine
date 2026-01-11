# 지형 및 구조물 시스템 설계

## 개요

mini-rpg에 타일맵 기반 지형과 개별 구조물 오브젝트를 추가한다. 플레이어와 적 모두 지형/구조물과 충돌 처리된다.

## 타일맵 시스템

### 타일 사양
- 타일 크기: 16x16 픽셀
- 맵 데이터: 2D 숫자 배열 (JS 코드 내장, 성능 최적화)

### 타일 종류

| ID | 타일 | 통과 | 색상 |
|----|------|------|------|
| 0 | 잔디 | O | 연두색 |
| 1 | 흙 | O | 갈색 |
| 2 | 물 | X | 파란색 |
| 3 | 벽 | X | 회색 |

### TileMap 컴포넌트

```
TileMap
├── tiles: number[][] (2D 배열)
├── tileSize: 16
├── getTileAt(x, y) → 타일 ID
├── isPassable(x, y) → boolean
└── render(context) → 타일 그리기
```

충돌 체크는 `isPassable()`로 월드 좌표를 타일 좌표로 변환 후 확인.

## 구조물 시스템

### 구조물 종류

| 종류 | 충돌 형태 | 크기 | 색상 |
|------|----------|------|------|
| 나무 | 원형 | 반지름 20 | 갈색(줄기) + 녹색(잎) |
| 바위 | 원형 | 반지름 16 | 회색 |

### Collider 컴포넌트

```
Collider
├── shape: 'circle' | 'rect'
├── radius: number (원형용)
├── width, height: number (사각형용)
├── offset: [x, y] (중심 오프셋)
└── collidesWith(other) → boolean
```

### 구조물 팩토리 함수

```javascript
createTree(x, y) → Object with ShapeRenderer + Collider
createRock(x, y) → Object with ShapeRenderer + Collider
```

기존 ShapeRenderer 재사용, Collider 컴포넌트 새로 추가.

## 충돌 처리

### 처리 흐름

PlayerController.didUpdate()에서:
1. 이동 의도 계산 (velocity * deltaTime)
2. 새 위치에서 타일맵 충돌 체크 (`tilemap.isPassable()`)
3. 새 위치에서 구조물 충돌 체크 (Collider 컴포넌트)
4. 충돌 시 이동 취소 또는 슬라이딩

EnemyAI도 동일하게 적용.

## 랜덤 배치

### 배치 규칙

GameScene.didCreate()에서:
- 플레이어 스폰 반경 100px 내 금지
- 기존 구조물과 겹침 검사
- 나무:바위 비율 = 7:3
- 최대 시도 횟수 제한 (무한루프 방지)

## 파일 구조

```
scripts/
├── components/
│   ├── tilemap.js      (NEW)
│   └── collider.js     (NEW)
├── objects/
│   └── structure.js    (NEW - createTree, createRock)
└── data/
    └── maps.js         (NEW - 맵 데이터)
```
