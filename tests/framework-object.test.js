import { describe, it, expect, vi } from 'vitest'
import { Object, Loopable, Enable, Stateful } from '../you/framework/object.js'

describe('Object', () => {
  describe('constructor', () => {
    it('events 옵션으로 이벤트 리스너를 등록한다', () => {
      const listener = vi.fn()
      const obj = new Object({ events: { test: listener } })

      obj.event.emit('test')

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('create()', () => {
    it('willCreate, didCreate를 순서대로 호출한다', () => {
      const order = []
      const obj = new Object()
      obj.willCreate = () => order.push('willCreate')
      obj.didCreate = () => order.push('didCreate')

      obj.create()

      expect(order).toEqual(['willCreate', 'didCreate'])
    })

    it('이벤트를 발생시킨다', () => {
      const willCreateListener = vi.fn()
      const didCreateListener = vi.fn()
      const obj = new Object({
        events: { willCreate: willCreateListener, didCreate: didCreateListener }
      })

      obj.create()

      expect(willCreateListener).toHaveBeenCalled()
      expect(didCreateListener).toHaveBeenCalled()
    })
  })

  describe('destroy()', () => {
    it('willDestroy, didDestroy를 순서대로 호출한다', () => {
      const order = []
      const obj = new Object()
      obj.willDestroy = () => order.push('willDestroy')
      obj.didDestroy = () => order.push('didDestroy')

      obj.destroy()

      expect(order).toEqual(['willDestroy', 'didDestroy'])
    })
  })
})

describe('Loopable', () => {
  describe('update()', () => {
    it('willUpdate, didUpdate를 순서대로 호출한다', () => {
      const order = []
      const obj = new Loopable()
      obj.willUpdate = () => order.push('willUpdate')
      obj.didUpdate = () => order.push('didUpdate')

      obj.update(16, {}, {})

      expect(order).toEqual(['willUpdate', 'didUpdate'])
    })

    it('이벤트를 발생시킨다', () => {
      const listener = vi.fn()
      const obj = new Loopable({ events: { willUpdate: listener } })

      obj.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('willRender, didRender를 순서대로 호출한다', () => {
      const order = []
      const obj = new Loopable()
      obj.willRender = () => order.push('willRender')
      obj.didRender = () => order.push('didRender')

      obj.render({}, {}, {})

      expect(order).toEqual(['willRender', 'didRender'])
    })
  })

  describe('render 시그니처', () => {
    it('willRender에 3개 파라미터가 전달된다', () => {
      const loopable = new Loopable()
      loopable.willRender = vi.fn()

      const context = {}
      const screen = {}
      const screens = {}

      loopable.render(context, screen, screens)

      expect(loopable.willRender).toHaveBeenCalledWith(context, screen, screens)
    })

    it('didRender에 3개 파라미터가 전달된다', () => {
      const loopable = new Loopable()
      loopable.didRender = vi.fn()

      const context = {}
      const screen = {}
      const screens = {}

      loopable.render(context, screen, screens)

      expect(loopable.didRender).toHaveBeenCalledWith(context, screen, screens)
    })
  })
})

describe('Enable', () => {
  describe('constructor', () => {
    it('기본값은 enable=true이다', () => {
      const obj = new Enable()
      expect(obj.enable).toBe(true)
    })

    it('enable=false로 생성할 수 있다', () => {
      const obj = new Enable({ enable: false })
      expect(obj.enable).toBe(false)
    })
  })

  describe('enable setter', () => {
    it('true로 설정하면 willBeEnabled, didBeEnabled가 호출된다', () => {
      const order = []
      const obj = new Enable({ enable: false })
      obj.willBeEnabled = () => order.push('willBeEnabled')
      obj.didBeEnabled = () => order.push('didBeEnabled')

      obj.enable = true

      expect(order).toEqual(['willBeEnabled', 'didBeEnabled'])
    })

    it('false로 설정하면 willBeDisabled, didBeDisabled가 호출된다', () => {
      const order = []
      const obj = new Enable({ enable: true })
      obj.willBeDisabled = () => order.push('willBeDisabled')
      obj.didBeDisabled = () => order.push('didBeDisabled')

      obj.enable = false

      expect(order).toEqual(['willBeDisabled', 'didBeDisabled'])
    })
  })

  describe('update()', () => {
    it('enable=false이면 update가 실행되지 않는다', () => {
      const obj = new Enable({ enable: false })
      const listener = vi.fn()
      obj.willUpdate = listener

      obj.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('enable=true이면 update가 실행된다', () => {
      const obj = new Enable({ enable: true })
      const listener = vi.fn()
      obj.willUpdate = listener

      obj.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('enable=false이면 render가 실행되지 않는다', () => {
      const obj = new Enable({ enable: false })
      const listener = vi.fn()
      obj.willRender = listener

      obj.render({}, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('enable=true이면 render가 실행된다', () => {
      const obj = new Enable({ enable: true })
      const listener = vi.fn()
      obj.willRender = listener

      obj.render({}, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })
})

describe('Stateful', () => {
  describe('constructor', () => {
    it('초기 상태는 INSTANTIATED이다', () => {
      const obj = new Stateful()
      expect(obj.created).toBe(false)
      expect(obj.destroyed).toBe(false)
    })
  })

  describe('create()', () => {
    it('INSTANTIATED 상태에서만 create가 동작한다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willCreate = listener

      obj.create()
      obj.create() // 두 번째 호출

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('create 후 created=true이다', () => {
      const obj = new Stateful()

      obj.create()

      expect(obj.created).toBe(true)
    })
  })

  describe('destroy()', () => {
    it('CREATED 상태에서만 destroy가 동작한다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willDestroy = listener

      obj.destroy() // INSTANTIATED 상태에서 호출

      expect(listener).not.toHaveBeenCalled()
    })

    it('destroy시 enable setter가 호출된다 (DESTROYING 상태에서는 무시됨)', () => {
      const obj = new Stateful()
      obj.create()

      obj.destroy()

      // Note: enable setter is called during DESTROYING state,
      // but Stateful's setter ignores changes during DESTROYING/DESTROYED states
      // so enable remains true
      expect(obj.enable).toBe(true)
    })

    it('destroy 후 destroyed=true이다', () => {
      const obj = new Stateful()
      obj.create()

      obj.destroy()

      expect(obj.destroyed).toBe(true)
    })
  })

  describe('enable setter (Stateful)', () => {
    it('DESTROYING/DESTROYED 상태에서는 enable을 변경할 수 없다', () => {
      const obj = new Stateful()
      obj.create()
      obj.destroy()

      // enable remains true because setter ignores changes in DESTROYING state
      // (see destroy() implementation and setter guard)
      obj.enable = false // try to change, but should be ignored

      // enable stays true because setter ignores in DESTROYED state
      expect(obj.enable).toBe(true)
    })
  })

  describe('update()', () => {
    it('CREATED 상태가 아니면 update가 실행되지 않는다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willUpdate = listener

      obj.update(16, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('CREATED + enable=true이면 update가 실행된다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willUpdate = listener
      obj.create()

      obj.update(16, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('CREATED 상태가 아니면 render가 실행되지 않는다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willRender = listener

      obj.render({}, {}, {})

      expect(listener).not.toHaveBeenCalled()
    })

    it('CREATED + enable=true이면 render가 실행된다', () => {
      const obj = new Stateful()
      const listener = vi.fn()
      obj.willRender = listener
      obj.create()

      obj.render({}, {}, {})

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('enable setter (Stateful 상세)', () => {
    it('CREATED 상태에서 enable을 true로 변경할 수 있다', () => {
      const obj = new Stateful({ enable: false })
      obj.create()
      const order = []
      obj.willBeEnabled = () => order.push('willBeEnabled')
      obj.didBeEnabled = () => order.push('didBeEnabled')

      obj.enable = true

      expect(obj.enable).toBe(true)
      expect(order).toEqual(['willBeEnabled', 'didBeEnabled'])
    })

    it('CREATED 상태에서 enable을 false로 변경할 수 있다', () => {
      const obj = new Stateful({ enable: true })
      obj.create()
      const order = []
      obj.willBeDisabled = () => order.push('willBeDisabled')
      obj.didBeDisabled = () => order.push('didBeDisabled')

      obj.enable = false

      expect(obj.enable).toBe(false)
      expect(order).toEqual(['willBeDisabled', 'didBeDisabled'])
    })

    it('DESTROYING 상태에서는 enable setter가 무시된다', () => {
      const obj = new Stateful()
      obj.create()
      // destroy 중 enable = false 호출이 무시되므로 enable은 true 유지
      obj.destroy()

      expect(obj.enable).toBe(true)
    })
  })
})
