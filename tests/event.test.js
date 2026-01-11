import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventEmitter } from '../you/utilities/event.js'

describe('EventEmitter', () => {
  let emitter

  beforeEach(() => {
    emitter = new EventEmitter()
  })

  describe('on()', () => {
    it('이벤트 리스너를 등록한다', () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.emit('test')

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('count=0이면 리스너를 등록하지 않는다', () => {
      const listener = vi.fn()

      emitter.on('test', listener, 0)
      emitter.emit('test')

      expect(listener).not.toHaveBeenCalled()
    })

    it('count가 양수이면 해당 횟수만큼만 실행된다', () => {
      const listener = vi.fn()

      emitter.on('test', listener, 2)
      emitter.emit('test')
      emitter.emit('test')
      emitter.emit('test')

      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('count=-1이면 무제한으로 실행된다', () => {
      const listener = vi.fn()

      emitter.on('test', listener, -1)
      emitter.emit('test')
      emitter.emit('test')
      emitter.emit('test')
      emitter.emit('test')
      emitter.emit('test')

      expect(listener).toHaveBeenCalledTimes(5)
    })
  })

  describe('emit()', () => {
    it('등록된 모든 리스너를 호출한다', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      emitter.on('test', listener1)
      emitter.on('test', listener2)
      emitter.on('test', listener3)

      emitter.emit('test')

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      expect(listener3).toHaveBeenCalledTimes(1)
    })

    it('인자를 리스너에 전달한다', () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.emit('test', 'arg1', 'arg2', 123)

      expect(listener).toHaveBeenCalledWith('arg1', 'arg2', 123)
    })

    it('일회성 리스너가 여러 개일 때 모두 실행된다', () => {
      // 이 테스트는 기존 버그를 검증함:
      // forEach 중 splice로 인해 일부 리스너가 건너뛰어지는 문제
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      emitter.on('test', listener1, 1)
      emitter.on('test', listener2, 1)
      emitter.on('test', listener3, 1)

      emitter.emit('test')

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      expect(listener3).toHaveBeenCalledTimes(1)
    })

    it('소진된 리스너는 다음 emit에서 실행되지 않는다', () => {
      const listener = vi.fn()

      emitter.on('test', listener, 1)
      emitter.emit('test')
      emitter.emit('test')

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('존재하지 않는 이벤트를 emit해도 에러가 발생하지 않는다', () => {
      expect(() => emitter.emit('nonexistent')).not.toThrow()
    })
  })

  describe('remove()', () => {
    it('특정 이벤트의 모든 리스너를 제거한다', () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.remove('test')
      emitter.emit('test')

      expect(listener).not.toHaveBeenCalled()
    })

    it('존재하지 않는 이벤트를 제거해도 에러가 발생하지 않는다', () => {
      expect(() => emitter.remove('nonexistent')).not.toThrow()
    })

    it('등록한 리스너를 제거할 수 있다', () => {
      const handler = vi.fn()

      emitter.on('test', handler)
      emitter.remove('test', handler)
      emitter.emit('test')

      expect(handler).not.toHaveBeenCalled()
    })

    it('특정 리스너만 제거된다', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.remove('test', handler1)
      emitter.emit('test')

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('존재하지 않는 리스너를 제거해도 에러가 발생하지 않는다', () => {
      const listener = vi.fn()

      emitter.on('test', listener)
      emitter.remove('test', vi.fn())
      emitter.emit('test')

      expect(listener).toHaveBeenCalled() // 기존 리스너는 그대로
    })
  })

  describe('bindingObject', () => {
    it('리스너의 this를 bindingObject로 바인딩한다', () => {
      const obj = { value: 42 }
      const boundEmitter = new EventEmitter(obj)
      let capturedThis = null

      boundEmitter.on('test', function() {
        capturedThis = this
      })
      boundEmitter.emit('test')

      expect(capturedThis).toBe(obj)
    })
  })
})
