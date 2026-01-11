// 타일 ID 상수
export const TILE = {
  GRASS: 0,
  DIRT: 1,
  WATER: 2,
  WALL: 3
}

// 통과 불가 타일 목록
export const IMPASSABLE_TILES = [TILE.WATER, TILE.WALL]

// 타일 색상
export const TILE_COLORS = {
  [TILE.GRASS]: '#4a7c3f',
  [TILE.DIRT]: '#8b6b4a',
  [TILE.WATER]: '#3a6ea5',
  [TILE.WALL]: '#6b6b6b'
}

// 맵 크기: 100x75 타일 (1600x1200 픽셀)
export const FOREST_MAP = generateForestMap(100, 75)

function generateForestMap(width, height) {
  const tiles = []
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      // 기본은 잔디
      let tile = TILE.GRASS

      // 가장자리는 물
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        tile = TILE.WATER
      }
      // 랜덤 흙 패치 (10% 확률)
      else if (Math.random() < 0.1) {
        tile = TILE.DIRT
      }
      // 랜덤 물웅덩이 (2% 확률, 가장자리 제외)
      else if (Math.random() < 0.02 && x > 5 && x < width - 5 && y > 5 && y < height - 5) {
        tile = TILE.WATER
      }

      row.push(tile)
    }
    tiles.push(row)
  }
  return tiles
}
