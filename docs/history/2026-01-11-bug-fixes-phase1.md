# 버그 수정 1차 보고서

## 개요

| 항목 | 내용 |
|------|------|
| **날짜** | 2026-01-11 |
| **작업자** | Claude Opus 4.5 |
| **브랜치** | feature/code-analysis |
| **작업 유형** | 버그 수정, 테스트 환경 구축 |

## 작업 배경

엔진 코드 전반에 대한 정비를 위해 코드 분석을 수행하고, 발견된 버그들을 우선순위에 따라 수정함.

## 환경 설정

### pnpm 및 Vitest 설정

- `package.json` 생성 (버전 0.1.0, ES 모듈)
- Vitest + @vitest/coverage-v8 설치
- jsdom 환경 설정 (브라우저 API 테스트 지원)
- 커버리지 임계값 80% 설정
- `.gitignore` 생성

## 버그 수정 상세

### 1. SceneApplication.pop() 메서드 버그

| 항목 | 내용 |
|------|------|
| **파일** | `you/application.js:58` |
| **심각도** | 높음 (즉시 크래시) |
| **증상** | `TypeError: this.queue.add is not a function` |

**원인**
```javascript
// 수정 전
this.queue.add({ type: 'pop', args });
```
Array에는 `add()` 메서드가 없음. `Set`의 메서드와 혼동.

**수정**
```javascript
// 수정 후
this.queue.push({ type: 'pop', args });
```

**영향 범위**
- `pop()` 메서드 직접 호출
- `transit()` 메서드 (내부적으로 `pop()` 사용)

---

### 2. procedure.js import 경로 오류

| 항목 | 내용 |
|------|------|
| **파일** | `you/utilities/procedure.js:1-2` |
| **심각도** | 높음 (모듈 로드 실패) |
| **증상** | `ERR_MODULE_NOT_FOUND` |

**원인**
```javascript
// 수정 전
import { Base as BaseObject } from "../../../libraries/you/framework/object.js";
import { EventEmitter } from "../../../libraries/you/utilities/event.js";
```
존재하지 않는 경로 참조. 또한 `Base` 클래스는 `framework/object.js`에 없음.

**수정**
```javascript
// 수정 후
import { Object as BaseObject } from "../framework/object.js";
import { EventEmitter } from "./event.js";
```

**영향 범위**
- `Task`, `Parallel`, `Procedure` 클래스 전체 사용 불가

---

### 3. Output.unlockPointer() 정의되지 않은 변수 참조

| 항목 | 내용 |
|------|------|
| **파일** | `you/framework/output.js:30` |
| **심각도** | 중간 |
| **증상** | `ReferenceError: screen is not defined` |

**원인**
```javascript
// 수정 전
unlockPointer() {
    screen.exitPointerLock();
}
```
`screen`은 메서드 스코프에 정의되지 않은 변수.

**수정**
```javascript
// 수정 후
unlockPointer() {
    document.exitPointerLock();
}
```

**영향 범위**
- 포인터 잠금 해제 기능

---

### 4. Array.intersects() 3D 큐브 검사 조건 오류

| 항목 | 내용 |
|------|------|
| **파일** | `you/math/geometry.js:56` |
| **심각도** | 중간 |
| **증상** | 3D 큐브 교차 검사 항상 실패 |

**원인**
```javascript
// 수정 전
else if (this.length === 6) {
    if (other.length === 4) {  // 잘못된 조건
```
3D 큐브는 `[x, y, z, w, h, d]`로 길이 6이어야 함.

**수정**
```javascript
// 수정 후
else if (this.length === 6) {
    if (other.length === 6) {  // 올바른 조건
```

**영향 범위**
- 3D 게임에서 큐브 충돌 검사

---

### 5. EventEmitter.emit() forEach 반복 중 배열 수정 버그

| 항목 | 내용 |
|------|------|
| **파일** | `you/utilities/event.js:31-42` |
| **심각도** | 중간 (간헐적 발생) |
| **증상** | 일부 일회성 리스너가 실행되지 않음 |

**원인**
```javascript
// 수정 전
this.eventGroups[event]?.forEach(([listener, count], index) => {
    // ...
    else if (count === 0) {
        this.eventGroups[event].splice(index, 1);  // 반복 중 삭제
        return;
    }
    listener?.(...args);
});
```
`forEach` 반복 중 `splice`로 요소 삭제 시 인덱스 어긋남.

**수정**
```javascript
// 수정 후
emit(event, ...args) {
    const listeners = this.eventGroups[event];
    if (!listeners) { return }

    for (const entry of listeners) {
        const [listener, count] = entry;
        if (count === 0) { continue }
        listener?.(...args);
        if (count > 0) { entry[1] -= 1; }
    }

    this.eventGroups[event] = listeners.filter(([, count]) => count !== 0);
}
```

**영향 범위**
- 일회성 이벤트 리스너 (`count=1`)가 여러 개 등록된 경우

## 추가된 테스트

| 테스트 파일 | 테스트 수 | 대상 모듈 |
|------------|----------|----------|
| `tests/application.test.js` | 3 | SceneApplication push/pop/transit |
| `tests/procedure.test.js` | 9 | Task, Parallel, Procedure |
| `tests/output.test.js` | 2 | Output addScreen/unlockPointer |
| `tests/geometry.test.js` | 11 | Array.intersects, Array.contains |
| `tests/event.test.js` | 11 | EventEmitter 전체 |

**총 테스트 수**: 37개 (기존 1개 포함)

## 커밋 히스토리

```
ed5db95 fix: EventEmitter.emit()에서 forEach 반복 중 배열 수정 버그 수정
7f9354a fix: Array.intersects() 3D 큐브 검사 조건 수정
959b75d fix: Output.unlockPointer()의 정의되지 않은 변수 참조 수정
69d2ab5 fix: procedure.js import 경로 오류 수정
f0278b7 fix: SceneApplication.pop() 메서드의 Array.add 버그 수정
```

## 다음 작업 예정

- 구조 개선 (framework/object.js 파라미터 시그니처 불일치 등)
- 문서화
- 테스트 커버리지 80% 달성
