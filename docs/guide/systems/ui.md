# UI

UI 시스템은 게임 인터페이스(버튼, 패널 등)를 구현합니다.

## View

View는 UI 요소의 기본 클래스입니다. Object를 상속하며 카메라 변환의 영향을 받지 않습니다.

```javascript
import { View } from './you/ui/view.js'

const panel = new View({
  position: [10, 10],
  size: [200, 100],
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderColor: 'white'
})
```

### 생성자 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `position` | [0, 0] | 위치 |
| `size` | (자동) | 크기 (null이면 부모 크기) |
| `backgroundColor` | null | 배경색 |
| `borderColor` | null | 테두리 색 |
| `borderWidth` | 1 | 테두리 두께 |
| `clip` | true | 영역 밖 클리핑 |
| `eventHandling` | true | 이벤트 처리 여부 |

Object와 동일한 옵션도 사용 가능:
- `name`, `enable`, `tags`, `components`, `objects`, `events`

### 속성

| 속성 | 설명 |
|------|------|
| `position` | 로컬 위치 |
| `size` | 크기 |
| `area` | [x, y, width, height] |
| `globalPosition` | 전역 위치 (부모 기준 계산) |
| `scene` | 소속된 Scene |

### 동적 위치/크기

position과 size에 함수를 전달하면 create 시점에 계산됩니다.

```javascript
// 화면 중앙에 배치
const centerPanel = new View({
  size: [200, 100],
  position: function() {
    const screen = this.scene.application.screen
    return [
      (screen.size[0] - this.size[0]) / 2,
      (screen.size[1] - this.size[1]) / 2
    ]
  }
})

// 부모 크기에 맞춤
const fullPanel = new View({
  size: null  // 부모 또는 화면 크기로 자동 설정
})
```

## 이벤트 처리

View는 마우스 이벤트를 자동으로 처리합니다.

```javascript
const button = new View({
  position: [100, 100],
  size: [120, 40],
  backgroundColor: '#444'
})

// 클릭 이벤트
button.event.on('click', () => {
  console.log('버튼 클릭!')
})

// 마우스 진입/퇴장
button.event.on('mousein', () => {
  button.backgroundColor = '#666'
})
button.event.on('mouseout', () => {
  button.backgroundColor = '#444'
})
```

### 이벤트 종류

| 이벤트 | 설명 |
|--------|------|
| `mousedown` | 마우스 버튼 눌림 |
| `mouseup` | 마우스 버튼 뗌 |
| `click` | 클릭 (down + up) |
| `mousemove` | 마우스 이동 |
| `mousein` | 마우스 진입 |
| `mouseout` | 마우스 퇴장 |
| `mousewheel` | 마우스 휠 |

### 이벤트 전파

View는 계층 구조에서 이벤트를 전파합니다.

```javascript
const panel = new View({
  position: [0, 0],
  size: [300, 200]
})

const button = new View({
  position: [10, 10],
  size: [100, 40]
})

panel.add(button)

// button 클릭은 panel로 전파되지 않음 (processed 처리)
button.event.on('click', () => {
  console.log('버튼만 반응')
})
```

## 계층 구조

View는 다른 View를 자식으로 가질 수 있습니다.

```javascript
const dialog = new View({
  position: [100, 50],
  size: [400, 300],
  backgroundColor: 'rgba(0, 0, 0, 0.9)'
})

const title = new View({
  position: [0, 0],
  size: [400, 40],
  backgroundColor: '#333'
})

const content = new View({
  position: [0, 40],
  size: [400, 220]
})

const closeButton = new View({
  position: [350, 10],
  size: [40, 20]
})

dialog.add(title)
dialog.add(content)
dialog.add(closeButton)

closeButton.event.on('click', () => {
  dialog.destroy()
})
```

## 버튼 예제

```javascript
class Button extends View {
  constructor({ text, onClick, ...options }) {
    super({
      backgroundColor: '#4a4a4a',
      ...options
    })

    this.text = text
    this.event.on('click', onClick)

    this.event.on('mousein', () => {
      this.backgroundColor = '#6a6a6a'
    })
    this.event.on('mouseout', () => {
      this.backgroundColor = '#4a4a4a'
    })
    this.event.on('mousedown', () => {
      this.backgroundColor = '#2a2a2a'
    })
    this.event.on('mouseup', () => {
      this.backgroundColor = '#6a6a6a'
    })
  }

  didRender(context) {
    context.fillStyle = 'white'
    context.font = '16px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(
      this.text,
      this.size[0] / 2,
      this.size[1] / 2
    )
  }
}

// 사용
const startButton = new Button({
  text: 'Start Game',
  position: [100, 200],
  size: [150, 50],
  onClick: () => {
    scene.transit(new GameScene())
  }
})

scene.add(startButton)
```

## 카메라와 View

View는 카메라 변환의 영향을 받지 않습니다. Scene은 렌더링 시 View와 일반 Object를 구분합니다.

```javascript
// 일반 Object: 카메라 영향 받음
const player = new Object({ ... })
const enemy = new Object({ ... })

// View: 카메라 영향 안 받음 (화면 고정)
const hud = new View({ ... })
const minimap = new View({ ... })

scene.add(player)   // 월드 좌표
scene.add(enemy)    // 월드 좌표
scene.add(hud)      // 화면 좌표
scene.add(minimap)  // 화면 좌표
```

## 다음

- [Scene](../core/scene.md) - UI와 Scene 연동
- [Graphics](graphics.md) - 렌더링
