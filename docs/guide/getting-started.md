# 시작하기

## 요구 사항

- 모던 브라우저 (ES6 모듈 지원)
- 로컬 서버 (file:// 프로토콜에서는 모듈 로드 불가)

## 설치

별도의 설치가 필요 없습니다. 프로젝트에 `you/` 폴더를 복사하고 ES6 모듈로 직접 import합니다.

```
my-game/
├── you/           # 엔진 복사
├── scripts/
│   └── game.js    # 게임 코드
└── index.html
```

## 기본 HTML 구조

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Game</title>
  <style>
    body { margin: 0; background: #000; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas></canvas>
  <script type="module" src="scripts/game.js"></script>
</body>
</html>
```

## 첫 번째 앱 만들기

### 1. 기본 구조

```javascript
// scripts/game.js
import { You } from '../you/you.js'
import { SceneApplication } from '../you/application.js'
import { Scene } from '../you/scene.js'

// 씬 정의
class MainScene extends Scene {
  update(deltaTime) {
    // 게임 로직
  }

  render(context) {
    // 렌더링
    context.fillStyle = 'white'
    context.font = '24px sans-serif'
    context.fillText('Hello, You-Engine!', 100, 100)
  }
}

// 애플리케이션 정의
class MyGame extends SceneApplication {
  onCreate() {
    this.push(new MainScene())
  }
}

// 엔진 실행
You.run({
  screens: {
    main: {
      canvas: document.querySelector('canvas'),
      size: [800, 600]
    }
  },
  applications: [new MyGame({ mainScreen: 'main' })]
})
```

### 2. You.run() 설정

```javascript
You.run({
  screens: {
    // 스크린 이름: 설정
    main: {
      canvas: document.querySelector('canvas'),  // canvas 요소
      size: [800, 600]  // [너비, 높이]
    }
  },
  applications: [
    // 실행할 애플리케이션 인스턴스
    new MyGame({ mainScreen: 'main' })
  ]
})
```

### 3. 게임 오브젝트 사용

```javascript
import { Object } from '../you/object.js'
import { Component } from '../you/component.js'

// 커스텀 컴포넌트
class PlayerController extends Component {
  update(deltaTime) {
    // 입력에 따라 오브젝트 이동
    if (this.engine.input.isKeyDown('ArrowRight')) {
      this.object.position[0] += 100 * deltaTime
    }
  }

  render(context) {
    const [x, y] = this.object.position
    context.fillStyle = 'blue'
    context.fillRect(x, y, 32, 32)
  }
}

class MainScene extends Scene {
  onCreate() {
    // 게임 오브젝트 생성
    this.player = new Object({
      position: [100, 100],
      components: [new PlayerController()]
    })
    this.add(this.player)
  }
}
```

## 리소스 로딩

엔진은 특별한 문자열 문법으로 리소스를 로드합니다.

### JSON 로드

```javascript
// @ 접두사로 JSON 파일 로드
const data = '@resources/data.json'

// 특정 키 접근
const enemies = '@resources/data.json:enemies'
const firstEnemy = '@resources/data.json:enemies.0'
```

### 이미지 로드

```javascript
import { Image } from '../you/graphics/image.js'

// image@ 접두사로 이미지 로드
const playerImage = 'image@resources/player.png'
// 또는 직접 생성
const playerImage = new Image('resources/player.png')
```

### 스프라이트 로드

```javascript
// sprite@ 접두사로 스프라이트 JSON 로드
const playerSprite = 'sprite@resources/player.json'
```

### 클래스 인스턴스화

JSON에서 클래스를 인스턴스화할 수 있습니다.

```json
{
  "@class": "./scripts/enemy.js:Enemy",
  "hp": 100,
  "speed": 50
}
```

## 다음 단계

- [Application](core/application.md) - 애플리케이션 구조 이해
- [Scene](core/scene.md) - 씬 라이프사이클
- [Object](core/object.md) - 게임 오브젝트 다루기
