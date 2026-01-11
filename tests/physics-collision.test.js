// tests/physics-collision.test.js
import { describe, it, expect } from 'vitest'
import {
  testAABB,
  testCircleCircle,
  testBoxCircle,
  getAABBContact,
  getCircleContact
} from '../you/physics/collision.js'

describe('collision utilities', () => {
  describe('testAABB', () => {
    it('두 박스가 겹치면 true 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 5, y: 5, width: 10, height: 10 }
      expect(testAABB(a, b)).toBe(true)
    })

    it('두 박스가 떨어져 있으면 false 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 20, y: 20, width: 10, height: 10 }
      expect(testAABB(a, b)).toBe(false)
    })

    it('박스가 맞닿아 있으면 false 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 10, y: 0, width: 10, height: 10 }
      expect(testAABB(a, b)).toBe(false)
    })
  })

  describe('testCircleCircle', () => {
    it('두 원이 겹치면 true 반환', () => {
      const a = { x: 0, y: 0, radius: 10 }
      const b = { x: 15, y: 0, radius: 10 }
      expect(testCircleCircle(a, b)).toBe(true)
    })

    it('두 원이 떨어져 있으면 false 반환', () => {
      const a = { x: 0, y: 0, radius: 10 }
      const b = { x: 25, y: 0, radius: 10 }
      expect(testCircleCircle(a, b)).toBe(false)
    })
  })

  describe('testBoxCircle', () => {
    it('박스와 원이 겹치면 true 반환', () => {
      const box = { x: 0, y: 0, width: 10, height: 10 }
      const circle = { x: 12, y: 5, radius: 5 }
      expect(testBoxCircle(box, circle)).toBe(true)
    })

    it('원이 박스 안에 있으면 true 반환', () => {
      const box = { x: 0, y: 0, width: 20, height: 20 }
      const circle = { x: 10, y: 10, radius: 5 }
      expect(testBoxCircle(box, circle)).toBe(true)
    })

    it('박스와 원이 떨어져 있으면 false 반환', () => {
      const box = { x: 0, y: 0, width: 10, height: 10 }
      const circle = { x: 20, y: 20, radius: 5 }
      expect(testBoxCircle(box, circle)).toBe(false)
    })
  })

  describe('getAABBContact', () => {
    it('충돌 정보 반환', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 }
      const b = { x: 8, y: 0, width: 10, height: 10 }
      const contact = getAABBContact(a, b)

      expect(contact.depth).toBe(2) // 10 - 8 = 2
      expect(contact.normal[0]).toBe(-1) // a를 왼쪽으로 밀어야 함
      expect(contact.normal[1]).toBe(0)
    })
  })

  describe('getCircleContact', () => {
    it('원-원 충돌 정보 반환', () => {
      const a = { x: 0, y: 0, radius: 10 }
      const b = { x: 15, y: 0, radius: 10 }
      const contact = getCircleContact(a, b)

      expect(contact.depth).toBe(5) // 20 - 15 = 5
      expect(contact.normal[0]).toBe(-1) // a를 왼쪽으로 밀어야 함
      expect(contact.normal[1]).toBeCloseTo(0) // -0 vs 0 floating point
    })
  })
})
