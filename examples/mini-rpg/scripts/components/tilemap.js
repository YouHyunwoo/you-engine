import { Component } from '../../../../you/component.js'
import { TILE_COLORS, IMPASSABLE_TILES } from '../data/maps.js'

export class TileMap extends Component {
  constructor({ tiles, tileSize = 16 } = {}) {
    super()
    this.tiles = tiles
    this.tileSize = tileSize
    this.width = tiles[0]?.length || 0
    this.height = tiles.length
  }

  // 월드 좌표 → 타일 좌표
  worldToTile(x, y) {
    return [
      Math.floor(x / this.tileSize),
      Math.floor(y / this.tileSize)
    ]
  }

  // 타일 좌표 → 월드 좌표 (타일 중심)
  tileToWorld(tx, ty) {
    return [
      tx * this.tileSize + this.tileSize / 2,
      ty * this.tileSize + this.tileSize / 2
    ]
  }

  // 특정 위치의 타일 ID 반환
  getTileAt(x, y) {
    const [tx, ty] = this.worldToTile(x, y)
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return -1 // 맵 밖
    }
    return this.tiles[ty][tx]
  }

  // 특정 위치가 통과 가능한지 확인
  isPassable(x, y) {
    const tile = this.getTileAt(x, y)
    if (tile === -1) return false
    return !IMPASSABLE_TILES.includes(tile)
  }

  // 원형 영역이 통과 가능한지 확인 (4방향 체크)
  isPassableCircle(x, y, radius) {
    return (
      this.isPassable(x - radius, y) &&
      this.isPassable(x + radius, y) &&
      this.isPassable(x, y - radius) &&
      this.isPassable(x, y + radius)
    )
  }

  didRender(context) {
    // 카메라 뷰포트 내의 타일만 렌더링 (최적화)
    const camera = this.object?.parent?.camera
    if (!camera) return

    const screenWidth = camera.screen.width
    const screenHeight = camera.screen.height
    const camX = camera.position[0]
    const camY = camera.position[1]

    const startX = Math.max(0, Math.floor((camX - screenWidth / 2) / this.tileSize))
    const endX = Math.min(this.width, Math.ceil((camX + screenWidth / 2) / this.tileSize))
    const startY = Math.max(0, Math.floor((camY - screenHeight / 2) / this.tileSize))
    const endY = Math.min(this.height, Math.ceil((camY + screenHeight / 2) / this.tileSize))

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = this.tiles[ty][tx]
        context.fillStyle = TILE_COLORS[tile] || '#ff00ff'
        context.fillRect(
          tx * this.tileSize,
          ty * this.tileSize,
          this.tileSize,
          this.tileSize
        )
      }
    }
  }
}
