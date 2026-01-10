# 오디오 시스템 설계

**날짜:** 2026-01-11
**상태:** 확정

## 개요

Web Audio API를 래핑한 게임 오디오 시스템. 효과음과 배경음악 재생을 지원하며, 풀링으로 효과음 중첩 재생을 처리한다.

## 파일 구조

```
you/audio/
├── audio.js           # Audio (단일 사운드)
└── audio-manager.js   # AudioManager (전역 관리, 풀링)
```

## Audio 클래스 (audio.js)

단일 사운드를 제어하는 저수준 클래스.

### 생성자 옵션

```javascript
new Audio({
  src,               // 오디오 파일 경로 (필수)
  volume: 1.0,       // 볼륨 0.0 ~ 1.0 (기본: 1.0)
  loop: false,       // 반복 여부 (기본: false)
})
```

### 메서드

```javascript
play()              // 재생
pause()             // 일시 정지
stop()              // 정지 (처음으로)
fadeIn(ms)          // 페이드 인 (0 → volume)
fadeOut(ms)         // 페이드 아웃 (volume → 0, 완료 후 정지)
```

### 속성

```javascript
volume              // 볼륨 (읽기/쓰기)
loop                // 반복 여부 (읽기/쓰기)
playing             // 재생 중 여부 (읽기)
loaded              // 로드 완료 여부 (읽기)
duration            // 전체 길이 (초, 읽기)
currentTime         // 현재 위치 (초, 읽기/쓰기)
```

### 이벤트

```javascript
audio.event.on('load', () => {})    // 로드 완료
audio.event.on('end', () => {})     // 재생 완료
audio.event.on('error', (e) => {})  // 로드/재생 에러
```

### 사용 예시

```javascript
import { Audio } from './audio/audio.js'

const bgm = new Audio({
  src: 'music.mp3',
  loop: true,
  volume: 0.7
})

bgm.event.on('load', () => {
  bgm.play()
})

// 페이드 아웃 후 정지
bgm.fadeOut(2000)
```

## AudioManager 클래스 (audio-manager.js)

여러 사운드를 관리하고 풀링을 제공하는 전역 매니저.

### 생성자

```javascript
new AudioManager()
```

### 메서드

```javascript
// 로드
load(id, src, poolSize = 1)   // poolSize: 동시 재생 가능 수

// 재생
play(id, options = {})        // options: { volume, loop }
                              // 풀에서 가용 인스턴스 사용

// 제어
pause(id)                     // 특정 사운드 일시 정지
resume(id)                    // 특정 사운드 재개
stop(id)                      // 특정 사운드 정지
stopAll()                     // 모든 사운드 정지

// 페이드
fadeIn(id, ms)                // 페이드 인
fadeOut(id, ms)               // 페이드 아웃

// 전역 제어
mute()                        // 전체 음소거
unmute()                      // 음소거 해제
```

### 속성

```javascript
masterVolume        // 전체 볼륨 (읽기/쓰기, 0.0 ~ 1.0)
muted               // 음소거 상태 (읽기)
```

### 이벤트

```javascript
manager.event.on('load', (id) => {})     // 특정 사운드 로드 완료
manager.event.on('loadAll', () => {})    // 모든 사운드 로드 완료
manager.event.on('error', (id, e) => {}) // 에러 발생
```

### 사용 예시

```javascript
import { AudioManager } from './audio/audio-manager.js'

const audio = new AudioManager()

// 로드 (효과음은 풀 크기 지정)
audio.load('bgm', 'music.mp3')
audio.load('jump', 'jump.mp3', 3)      // 최대 3개 중첩
audio.load('gunshot', 'gun.mp3', 5)    // 최대 5개 중첩

// 배경음악 재생
audio.play('bgm', { loop: true, volume: 0.7 })

// 효과음 재생 (빠르게 연속 호출해도 중첩됨)
audio.play('gunshot')
audio.play('gunshot')
audio.play('gunshot')

// 전역 볼륨
audio.masterVolume = 0.8

// 페이드 아웃 후 정지
audio.fadeOut('bgm', 2000)
```

## 풀링 동작 방식

```javascript
audio.load('gunshot', 'gun.mp3', 3)
```

내부적으로 3개의 Audio 인스턴스가 생성됨:
```
Pool['gunshot'] = [Audio, Audio, Audio]
```

`play('gunshot')` 호출 시:
1. 풀에서 `playing === false`인 인스턴스 찾기
2. 있으면 해당 인스턴스로 재생
3. 없으면 (모두 재생 중) 가장 오래된 인스턴스 재사용

## 볼륨 계산

최종 볼륨 = `masterVolume * audio.volume`

```javascript
audio.masterVolume = 0.8
audio.play('jump', { volume: 0.5 })
// 실제 볼륨: 0.8 * 0.5 = 0.4
```

## 기존 시스템과의 관계

- **Engine**: AudioManager를 Engine에 등록하여 전역 접근 가능 (선택)
- **Resource**: 리소스 로더와 통합 가능 (`audio@path/to/file.mp3`)
- **Tween**: fadeIn/fadeOut 내부 구현에 트위닝 로직 활용 가능

## 지원 포맷

브라우저 Web Audio API 지원에 따름:
- MP3 (권장, 범용)
- OGG (권장, 오픈 포맷)
- WAV (무손실, 파일 큼)
- AAC/M4A (iOS 호환)
