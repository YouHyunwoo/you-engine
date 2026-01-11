# You-Engine

웹 기반 2D 게임 엔진. 순수 JavaScript(ES6 모듈)로 작성되었으며, 빌드 도구 없이 브라우저에서 직접 실행됩니다.

## 특징

- **빌드 없음** - 번들러, TypeScript 없이 ES6 모듈로 직접 실행
- **클래스 기반** - 명확한 객체 지향 설계
- **컴포넌트 시스템** - 게임 오브젝트에 기능을 조합
- **씬 관리** - 씬 스택으로 화면 전환 관리
- **경량** - 필요한 기능만 간결하게 구현

## 빠른 시작

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game</title>
</head>
<body>
  <canvas></canvas>
  <script type="module">
    import { You } from './you/you.js'
    import { SceneApplication } from './you/application.js'
    import { Scene } from './you/scene.js'

    class MyScene extends Scene {
      render(context) {
        context.fillStyle = 'white'
        context.fillText('Hello, You-Engine!', 100, 100)
      }
    }

    class MyGame extends SceneApplication {
      onCreate() {
        this.push(new MyScene())
      }
    }

    You.run({
      screens: {
        main: {
          canvas: document.querySelector('canvas'),
          size: [800, 600]
        }
      },
      applications: [new MyGame({ mainScreen: 'main' })]
    })
  </script>
</body>
</html>
```

## 프로젝트 구조

```
you/                    # 엔진 코어
├── you.js             # 메인 엔트리 (You.run)
├── engine.js          # 엔진 클래스
├── application.js     # Application, SceneApplication
├── scene.js           # 씬 관리
├── object.js          # 게임 오브젝트
├── component.js       # 컴포넌트 시스템
├── camera.js          # 카메라
├── framework/         # 코어 프레임워크
├── graphics/          # 렌더링 (Image, Sprite, Label)
├── math/              # 벡터, 지오메트리, 랜덤
├── animation/         # 트위닝, 애니메이션
└── ui/                # UI 시스템

examples/              # 예제 게임
docs/                  # 문서
```

## 문서

- [개발자 가이드](docs/guide/index.md) - 엔진 사용법 상세 문서

## 개발

### 요구 사항

- Node.js 18+
- pnpm

### 테스트 실행

```bash
pnpm install
pnpm test
```

### 브랜치 전략

- `develop` - 개발 브랜치
- `feature/*` - 기능 개발 브랜치
- Squash merge로 피처당 하나의 커밋 유지

### 커밋 컨벤션

Conventional Commits 형식, 한국어 사용:

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 변경
test: 테스트 추가/수정
chore: 기타 작업
```

## 라이선스

MIT
