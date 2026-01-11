export function parseColor(color) {
  // hex 6자리
  if (color.match(/^#[0-9a-fA-F]{6}$/)) {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
      1,
    ]
  }

  // hex 3자리
  if (color.match(/^#[0-9a-fA-F]{3}$/)) {
    return [
      parseInt(color[1] + color[1], 16),
      parseInt(color[2] + color[2], 16),
      parseInt(color[3] + color[3], 16),
      1,
    ]
  }

  // rgb
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1]),
      parseInt(rgbMatch[2]),
      parseInt(rgbMatch[3]),
      1,
    ]
  }

  // rgba
  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      parseFloat(rgbaMatch[4]),
    ]
  }

  // 기본값
  return [255, 255, 255, 1]
}

export function lerpColor(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
    from[3] + (to[3] - from[3]) * t,
  ]
}

export function colorToString(rgba) {
  return `rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]})`
}
