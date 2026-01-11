# Changelog

모든 주요 변경 사항을 기록합니다. [Semantic Versioning](https://semver.org/)을 따릅니다.

## [0.2.0] - 개발 중

### 추가
- **트위닝 시스템** (`you/animation/`)
  - `Easing` - 18개 이징 함수
  - `Tween` - Task 상속, Procedure와 조합 가능
  - `TweenComponent` - Object에 부착 가능한 컴포넌트

### 설계 완료 (구현 예정)
- 스프라이트 애니메이션 시스템
- 오디오 시스템
- 물리 시스템
- 파티클 시스템

### 문서
- 개발자 가이드 문서 체계 구축 (`docs/guide/`)

## [0.1.0] - 초기 버전

### 핵심 기능
- **Engine** - 게임 루프, 서브시스템 관리
- **Application/SceneApplication** - 앱 및 씬 스택 관리
- **Scene** - 게임 오브젝트 컨테이너, 카메라
- **Object** - 컴포넌트/자식 계층 구조
- **Component** - 재사용 가능한 기능 단위

### 그래픽
- **Image** - 이미지 로드/렌더링
- **Sprite** - 스프라이트 시트, 스케일/앵커
- **Label** - 텍스트 렌더링

### 입력
- 키보드 입력 (폴링 + 이벤트)
- 마우스 입력 (위치, 버튼, 휠)
- 포인터 잠금

### 수학
- 벡터 연산 (Array 프로토타입 확장)
- 지오메트리 (AABB 충돌, 영역 연산)
- 랜덤 유틸리티

### UI
- **View** - UI 기본 클래스, 마우스 이벤트 처리

### 리소스
- JSON 로드 (`@path`)
- 이미지 로드 (`image@path`)
- 스프라이트 로드 (`sprite@path`)
- 클래스 인스턴스화 (`@class`)

### 테스트
- Vitest 테스트 프레임워크 도입
- 테스트 커버리지 80% 달성

### 버그 수정
- EventEmitter.emit()에서 forEach 반복 중 배열 수정 버그 수정

---

## 버전 규칙

- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 하위 호환 기능 추가
- **PATCH**: 하위 호환 버그 수정

현재 0.x.x 버전은 초기 개발 단계로, API가 변경될 수 있습니다.
