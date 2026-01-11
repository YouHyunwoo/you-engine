// you/physics/collision.js

/**
 * AABB 충돌 테스트
 * @param {{x: number, y: number, width: number, height: number}} a
 * @param {{x: number, y: number, width: number, height: number}} b
 * @returns {boolean}
 */
export function testAABB(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

/**
 * 원-원 충돌 테스트
 * @param {{x: number, y: number, radius: number}} a
 * @param {{x: number, y: number, radius: number}} b
 * @returns {boolean}
 */
export function testCircleCircle(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < a.radius + b.radius
}

/**
 * 박스-원 충돌 테스트
 * @param {{x: number, y: number, width: number, height: number}} box
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {boolean}
 */
export function testBoxCircle(box, circle) {
  // 원의 중심에서 박스까지의 최근접점 계산
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width))
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height))

  const dx = circle.x - closestX
  const dy = circle.y - closestY
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance < circle.radius
}

/**
 * AABB 충돌 정보 계산
 * @param {{x: number, y: number, width: number, height: number}} a
 * @param {{x: number, y: number, width: number, height: number}} b
 * @returns {{point: number[], normal: number[], depth: number}}
 */
export function getAABBContact(a, b) {
  // 각 축에서의 침투 깊이 계산
  const overlapX1 = (a.x + a.width) - b.x  // a의 오른쪽 - b의 왼쪽
  const overlapX2 = (b.x + b.width) - a.x  // b의 오른쪽 - a의 왼쪽
  const overlapY1 = (a.y + a.height) - b.y // a의 아래 - b의 위
  const overlapY2 = (b.y + b.height) - a.y // b의 아래 - a의 위

  // 최소 침투 축 찾기
  const minOverlapX = Math.min(overlapX1, overlapX2)
  const minOverlapY = Math.min(overlapY1, overlapY2)

  let normal, depth

  if (minOverlapX < minOverlapY) {
    depth = minOverlapX
    normal = overlapX1 < overlapX2 ? [-1, 0] : [1, 0]
  } else {
    depth = minOverlapY
    normal = overlapY1 < overlapY2 ? [0, -1] : [0, 1]
  }

  // 충돌 지점 (두 박스 중심의 중간)
  const point = [
    (a.x + a.width / 2 + b.x + b.width / 2) / 2,
    (a.y + a.height / 2 + b.y + b.height / 2) / 2
  ]

  return { point, normal, depth }
}

/**
 * 원-원 충돌 정보 계산
 * @param {{x: number, y: number, radius: number}} a
 * @param {{x: number, y: number, radius: number}} b
 * @returns {{point: number[], normal: number[], depth: number}}
 */
export function getCircleContact(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // 두 원이 같은 위치에 있는 경우
  if (distance === 0) {
    return {
      point: [a.x, a.y],
      normal: [1, 0],
      depth: a.radius + b.radius
    }
  }

  const normal = [-dx / distance, -dy / distance]
  const depth = a.radius + b.radius - distance
  const point = [
    a.x + dx / 2,
    a.y + dy / 2
  ]

  return { point, normal, depth }
}

/**
 * 박스-원 충돌 정보 계산
 * @param {{x: number, y: number, width: number, height: number}} box
 * @param {{x: number, y: number, radius: number}} circle
 * @returns {{point: number[], normal: number[], depth: number}}
 */
export function getBoxCircleContact(box, circle) {
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width))
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height))

  const dx = circle.x - closestX
  const dy = circle.y - closestY
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) {
    // 원 중심이 박스 안에 있음
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const cdx = circle.x - centerX
    const cdy = circle.y - centerY

    if (Math.abs(cdx) > Math.abs(cdy)) {
      return {
        point: [closestX, closestY],
        normal: cdx > 0 ? [1, 0] : [-1, 0],
        depth: circle.radius + (cdx > 0 ? box.x + box.width - circle.x : circle.x - box.x)
      }
    } else {
      return {
        point: [closestX, closestY],
        normal: cdy > 0 ? [0, 1] : [0, -1],
        depth: circle.radius + (cdy > 0 ? box.y + box.height - circle.y : circle.y - box.y)
      }
    }
  }

  return {
    point: [closestX, closestY],
    normal: [-dx / distance, -dy / distance],
    depth: circle.radius - distance
  }
}
