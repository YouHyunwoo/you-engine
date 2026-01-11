import { describe, it, expect } from 'vitest'
import { Resource } from '../you/resource.js'

describe('Resource', () => {
  describe('clear', () => {
    it('prefix 속성은 유지된다', () => {
      const resource = new Resource({ prefix: 'test/' })
      resource.testData = { foo: 'bar' }

      resource.clear()

      expect(resource.prefix).toBe('test/')
    })

    it('동적으로 추가된 리소스는 삭제된다', () => {
      const resource = new Resource({ prefix: 'test/' })
      resource.testData = { foo: 'bar' }

      resource.clear()

      expect(resource.testData).toBeUndefined()
    })
  })
})
