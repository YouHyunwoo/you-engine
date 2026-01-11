# You-Engine 개발자 가이드

You-Engine은 웹 기반 2D 게임 엔진입니다. 순수 JavaScript(ES6 모듈)로 작성되어 빌드 도구 없이 브라우저에서 직접 실행됩니다.

## 설계 철학

- **순수 JavaScript** - TypeScript나 빌드 도구 없이 ES6 모듈만 사용
- **클래스 기반 OOP** - 명확한 상속 구조와 라이프사이클
- **컴포넌트 조합** - 게임 오브젝트에 기능을 컴포넌트로 조합
- **이벤트 기반** - EventEmitter 패턴으로 느슨한 결합

## 문서 목차

### 시작하기

- [시작하기](getting-started.md) - 설치, 기본 설정, 첫 번째 앱

### 핵심 클래스

- [Engine](core/engine.md) - 엔진 초기화 및 시스템 관리
- [Application](core/application.md) - 애플리케이션과 씬 스택 관리
- [Scene](core/scene.md) - 씬 라이프사이클과 오브젝트 관리
- [Object](core/object.md) - 게임 오브젝트와 계층 구조
- [Component](core/component.md) - 컴포넌트 작성과 라이프사이클

### 시스템

- [Graphics](systems/graphics.md) - 이미지, 스프라이트, 텍스트 렌더링
- [Input](systems/input.md) - 키보드, 마우스 입력 처리
- [Math](systems/math.md) - 벡터 연산, 지오메트리, 랜덤
- [UI](systems/ui.md) - UI 시스템

### 예제

- [Defense](examples/defense.md) - 디펜스 게임 예제 해설
- [Maze Generation](examples/maze-generation.md) - 미로 생성 예제 해설

### 기타

- [Changelog](changelog.md) - 버전별 변경 내역

## 읽는 순서

1. **[시작하기](getting-started.md)** - 기본 설정과 첫 번째 앱 만들기
2. **[Application](core/application.md)**, **[Scene](core/scene.md)** - 앱과 씬 구조 이해
3. **[Object](core/object.md)**, **[Component](core/component.md)** - 게임 오브젝트 다루기
4. **시스템 문서** - 필요한 기능별로 참조
5. **예제 해설** - 실제 게임 구현 사례 학습
