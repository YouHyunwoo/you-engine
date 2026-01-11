import { describe, it, expect } from 'vitest'
import { parseColor, lerpColor, colorToString } from '../you/particle/color.js'

describe('parseColor', () => {
  it('6자리 hex 색상을 파싱한다', () => {
    expect(parseColor('#ff0000')).toEqual([255, 0, 0, 1])
    expect(parseColor('#00ff00')).toEqual([0, 255, 0, 1])
    expect(parseColor('#0000ff')).toEqual([0, 0, 255, 1])
  })

  it('3자리 hex 색상을 파싱한다', () => {
    expect(parseColor('#f00')).toEqual([255, 0, 0, 1])
    expect(parseColor('#0f0')).toEqual([0, 255, 0, 1])
  })

  it('rgb 색상을 파싱한다', () => {
    expect(parseColor('rgb(255, 128, 0)')).toEqual([255, 128, 0, 1])
  })

  it('rgba 색상을 파싱한다', () => {
    expect(parseColor('rgba(255, 128, 0, 0.5)')).toEqual([255, 128, 0, 0.5])
  })

  it('잘못된 형식은 흰색을 반환한다', () => {
    expect(parseColor('invalid')).toEqual([255, 255, 255, 1])
  })
})

describe('lerpColor', () => {
  it('두 색상을 선형 보간한다', () => {
    const from = [255, 0, 0, 1]
    const to = [0, 255, 0, 1]

    const result = lerpColor(from, to, 0.5)

    expect(result[0]).toBeCloseTo(127.5)
    expect(result[1]).toBeCloseTo(127.5)
    expect(result[2]).toBe(0)
    expect(result[3]).toBe(1)
  })

  it('t=0이면 from 색상을 반환한다', () => {
    const from = [255, 0, 0, 1]
    const to = [0, 255, 0, 1]

    expect(lerpColor(from, to, 0)).toEqual(from)
  })

  it('t=1이면 to 색상을 반환한다', () => {
    const from = [255, 0, 0, 1]
    const to = [0, 255, 0, 1]

    expect(lerpColor(from, to, 1)).toEqual(to)
  })
})

describe('colorToString', () => {
  it('RGBA 배열을 문자열로 변환한다', () => {
    expect(colorToString([255, 0, 0, 1])).toBe('rgba(255, 0, 0, 1)')
    expect(colorToString([128, 64, 32, 0.5])).toBe('rgba(128, 64, 32, 0.5)')
  })
})
