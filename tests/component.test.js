import { describe, it, expect, vi } from 'vitest'
import { Component } from '../you/component.js'
import { Stateful } from '../you/framework/object.js'

describe('Component', () => {
  describe('constructor', () => {
    it('기본값은 enable=true이다', () => {
      const component = new Component()
      expect(component.enable).toBe(true)
    })

    it('object는 null로 초기화된다', () => {
      const component = new Component()
      expect(component.object).toBeNull()
    })
  })

  describe('update()', () => {
    it('enable=false이면 실행되지 않는다', () => {
      const component = new Component({ enable: false })
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('object가 없으면 실행되지 않는다', () => {
      const component = new Component()
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('object.created=false이면 실행되지 않는다', () => {
      const component = new Component()
      const mockObject = { created: false }
      component.object = mockObject
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('enable=true, object.created=true이면 실행된다', () => {
      const component = new Component()
      const mockObject = { created: true }
      component.object = mockObject
      const listener = vi.fn()
      component.willUpdate = listener

      component.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('enable=true, object.created=true이면 실행된다', () => {
      const component = new Component()
      const mockObject = { created: true }
      component.object = mockObject
      const listener = vi.fn()
      component.willRender = listener

      component.render({}, {}, {})

      expect(listener).toHaveBeenCalled()
    })

    it('조건을 만족하지 않으면 실행되지 않는다', () => {
      const component = new Component({ enable: false })
      const listener = vi.fn()
      component.willRender = listener

      component.render({}, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
