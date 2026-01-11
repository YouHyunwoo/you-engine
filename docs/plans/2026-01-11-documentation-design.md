# 문서화 설계

**날짜:** 2026-01-11
**상태:** 확정

## 개요

프로젝트 문서를 체계적으로 정리한다. README.md를 개선하고, 엔진 사용자를 위한 개발자 가이드를 `docs/guide/`에 작성한다.

## 문서 구조

```
/
├── README.md                    # 프로젝트 진입점
└── docs/
    └── guide/                   # 개발자 가이드
        ├── index.md             # 개요 및 목차
        ├── getting-started.md   # 시작하기
        ├── core/                # 핵심 클래스
        │   ├── engine.md
        │   ├── application.md
        │   ├── scene.md
        │   ├── object.md
        │   └── component.md
        ├── systems/             # 시스템별 문서
        │   ├── graphics.md
        │   ├── input.md
        │   ├── math.md
        │   └── ui.md
        ├── examples/            # 예제 게임 해설
        │   ├── defense.md
        │   └── maze-generation.md
        └── changelog.md         # 버전 히스토리
```

## 1. README.md

**위치:** 루트
**대상:** 사용자 + 기여자
**분량:** 1-2페이지

### 포함 내용

1. **프로젝트 소개**
   - 한 줄 설명
   - 주요 특징 (3-5개)

2. **빠른 시작**
   - 최소한의 HTML + JS 코드 예제
   - 실행 방법

3. **프로젝트 구조**
   - 폴더 개요 (you/, examples/, docs/)

4. **문서**
   - 개발자 가이드 링크 (`docs/guide/`)

5. **개발**
   - 테스트 실행 방법 (`pnpm test`)
   - 브랜치 전략
   - 커밋 컨벤션

6. **라이선스**

## 2. 개발자 가이드 (docs/guide/)

### index.md - 개요 및 목차

- 엔진 소개
  - You-Engine이란?
  - 설계 철학 (순수 JS, 빌드 없음, 클래스 기반)
- 문서 목차 (전체 링크)
- 읽는 순서 안내

### getting-started.md - 시작하기

- 요구 사항 (모던 브라우저, ES6 모듈 지원)
- 설치 (빌드 시스템 없음, 직접 import)
- 기본 HTML 구조
- 첫 번째 앱 만들기
  - You.run() 사용법
  - Screen 설정
  - Application 작성
- 리소스 로딩 문법
  - `@path` - JSON
  - `image@path` - 이미지
  - `sprite@path` - 스프라이트
  - `{ '@class': ... }` - 클래스 인스턴스화

### core/ - 핵심 클래스

#### engine.md
- Engine 클래스 역할
- 서브시스템 관리 (Loop, Input, Output, Event)
- 초기화 흐름

#### application.md
- Application vs SceneApplication
- 라이프사이클 메서드
- 씬 스택 관리 (push, pop, replace)

#### scene.md
- Scene 역할
- 게임 오브젝트 관리
- 카메라 설정
- 라이프사이클 (create, update, render)

#### object.md
- Object 클래스
- 컴포넌트 추가/제거
- 자식 오브젝트 계층
- 상태 (INSTANTIATED → CREATED → DESTROYING → DESTROYED)

#### component.md
- Component 작성법
- 라이프사이클 (create, update, render)
- Object에 부착하기
- 컴포넌트 찾기 (findComponent)

### systems/ - 시스템별 문서

#### graphics.md
- Image - 이미지 로드 및 렌더링
- Sprite - 스프라이트 시트, 영역 지정
- Label - 텍스트 렌더링

#### input.md
- 키보드 입력 (isKeyDown, isKeyPressed, isKeyReleased)
- 마우스 입력 (위치, 버튼 상태)
- 이벤트 기반 vs 폴링 방식

#### math.md
- Vector 연산 (Array 프로토타입 확장)
- Geometry (충돌 감지, AABB)
- Random 유틸리티

#### ui.md
- View 시스템
- UI 요소 구성

### examples/ - 예제 게임 해설

#### defense.md
- 게임 개요
- 파일 구조
- 참고 포인트
  - 엔진 초기화 방법
  - Scene 구성
  - Object/Component 활용
  - 입력 처리
  - 렌더링

#### maze-generation.md
- 게임 개요
- 파일 구조
- 참고 포인트
  - 알고리즘 구현
  - 그리드 렌더링
  - 상태 관리

### changelog.md - 버전 히스토리

- Semantic Versioning (MAJOR.MINOR.PATCH)
- 버전별 변경 내역
  - 새 기능
  - 버그 수정
  - 변경 사항

## 작성 원칙

1. **간결함** - 불필요한 설명 최소화
2. **코드 예제 중심** - 모든 개념에 코드 예제 포함
3. **상호 참조** - 관련 문서 링크 연결
4. **한국어** - 모든 문서는 한국어로 작성

## 구현 순서

1. README.md 작성
2. docs/guide/index.md 작성
3. docs/guide/getting-started.md 작성
4. docs/guide/core/*.md 작성
5. docs/guide/systems/*.md 작성
6. docs/guide/examples/*.md 작성
7. docs/guide/changelog.md 작성
