# Graphics

이미지, 스프라이트, 텍스트 렌더링을 위한 클래스들입니다.

## Image

이미지를 로드하고 렌더링합니다.

```javascript
import { Image } from './you/graphics/image.js'

const playerImage = new Image('resources/player.png')
```

### 속성

| 속성 | 설명 |
|------|------|
| `url` | 이미지 경로 |
| `loaded` | 로드 완료 여부 |
| `width` | 너비 |
| `height` | 높이 |
| `size` | [너비, 높이] |
| `raw` | 원본 HTMLImageElement |

### 메서드

```javascript
// 렌더링 (Canvas drawImage와 동일한 인자)
image.render(context, x, y)
image.render(context, x, y, width, height)
image.render(context, sx, sy, sw, sh, dx, dy, dw, dh)
```

### 사용 예시

```javascript
class PlayerRenderer extends Component {
  image = new Image('player.png')

  didRender(context) {
    if (!this.image.loaded) return

    const [x, y] = this.object.position
    this.image.render(context, x, y)
  }
}
```

## Sprite

이미지의 일부 영역을 스케일과 앵커를 적용하여 렌더링합니다.

```javascript
import { Sprite } from './you/graphics/sprite.js'
import { Image } from './you/graphics/image.js'

const sprite = new Sprite({
  sheet: new Image('spritesheet.png'),
  scale: [2, 2],
  anchor: [0.5, 0.5],
  croppingArea: [0, 0, 32, 32]
})
```

### 생성자 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `sheet` | (필수) | Image 객체 |
| `scale` | [1, 1] | 스케일 |
| `anchor` | [0, 0] | 앵커 (0~1) |
| `croppingArea` | null | 영역 [x, y, w, h] |

### 앵커

앵커는 이미지의 기준점을 지정합니다.

```
[0, 0]     [0.5, 0]    [1, 0]
  +----------+----------+
  |                     |
  +        [0.5, 0.5]   +
  |                     |
  +----------+----------+
[0, 1]     [0.5, 1]    [1, 1]
```

```javascript
// 중앙 기준
const sprite = new Sprite({
  sheet: image,
  anchor: [0.5, 0.5]
})

// 하단 중앙 기준 (캐릭터에 유용)
const character = new Sprite({
  sheet: image,
  anchor: [0.5, 1]
})
```

### 속성

| 속성 | 설명 |
|------|------|
| `sheet` | Image 객체 |
| `scale` | 스케일 |
| `anchor` | 앵커 |
| `croppingArea` | 영역 |
| `area` | 계산된 렌더링 영역 |

### 메서드

```javascript
sprite.render(context, x, y)
```

### 리소스 로딩

JSON으로 스프라이트를 정의할 수 있습니다.

```json
// resources/player.json
{
  "sheet": "image@resources/player.png",
  "scale": [2, 2],
  "anchor": [0.5, 1],
  "croppingArea": [0, 0, 32, 48]
}
```

```javascript
// 로드
const playerSprite = 'sprite@resources/player.json'
```

## Label

텍스트를 렌더링합니다.

```javascript
import { Label } from './you/graphics/label.js'

const label = new Label({
  text: 'Score: 0',
  position: [10, 10],
  size: [200, 30],
  color: 'white',
  fontSize: '24px',
  fontFamily: 'Arial'
})
```

### 생성자 옵션

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `text` | '' | 표시할 텍스트 |
| `position` | [0, 0] | 위치 |
| `size` | [0, 0] | 크기 |
| `color` | 'black' | 글자 색상 |
| `fontSize` | '12px' | 폰트 크기 |
| `fontFamily` | 'Arial' | 폰트 패밀리 |
| `backgroundColor` | null | 배경색 |
| `alignment` | { horizontal: 'center', vertical: 'middle' } | 정렬 |

### 정렬

```javascript
// 좌측 상단 정렬
alignment: { horizontal: 'left', vertical: 'top' }

// 중앙 정렬
alignment: { horizontal: 'center', vertical: 'middle' }

// 우측 하단 정렬
alignment: { horizontal: 'right', vertical: 'bottom' }
```

### 속성

| 속성 | 설명 |
|------|------|
| `text` | 텍스트 |
| `position` | 위치 |
| `size` | 크기 |
| `color` | 글자 색상 |
| `font` | 폰트 (fontSize + fontFamily) |
| `area` | [x, y, width, height] |

### 사용 예시

```javascript
class ScoreDisplay extends Component {
  label = new Label({
    position: [10, 10],
    size: [150, 30],
    color: 'white',
    fontSize: '20px',
    alignment: { horizontal: 'left', vertical: 'top' }
  })

  didCreate() {
    this.updateScore(0)
  }

  updateScore(score) {
    this.label.text = `Score: ${score}`
  }

  didRender(context) {
    this.label.render(context)
  }
}
```

## 다음

- [Input](input.md) - 입력 시스템
- [Component](../core/component.md) - 렌더링 컴포넌트 작성
