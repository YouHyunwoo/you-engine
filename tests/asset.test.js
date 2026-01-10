import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Asset } from '../you/asset.js'

describe('Asset', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('constructor', () => {
    it('localStorage에 데이터가 없으면 initialData로 초기화한다', () => {
      const asset = new Asset('test-id', { score: 100, level: 1 })

      expect(asset.id).toBe('test-id')
      expect(asset.score).toBe(100)
      expect(asset.level).toBe(1)
    })

    it('localStorage에 데이터가 있으면 불러온다', () => {
      localStorage.setItem('test-id', JSON.stringify({ score: 500, level: 10 }))

      const asset = new Asset('test-id', { score: 0, level: 0 })

      expect(asset.score).toBe(500)
      expect(asset.level).toBe(10)
    })

    it('initialData가 localStorage에 저장된다', () => {
      new Asset('test-id', { score: 100 })

      const stored = JSON.parse(localStorage.getItem('test-id'))
      expect(stored.score).toBe(100)
    })
  })

  describe('save()', () => {
    it('현재 상태를 localStorage에 저장한다', () => {
      const asset = new Asset('test-id', { score: 100 })
      asset.score = 999

      asset.save()

      const stored = JSON.parse(localStorage.getItem('test-id'))
      expect(stored.score).toBe(999)
    })

    it('id는 저장하지 않는다', () => {
      const asset = new Asset('test-id', { score: 100 })

      asset.save()

      const stored = JSON.parse(localStorage.getItem('test-id'))
      expect(stored.id).toBeUndefined()
    })
  })
})
