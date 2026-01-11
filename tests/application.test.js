import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Application, SceneApplication } from '../you/application.js'

describe('Application', () => {
  let app

  beforeEach(() => {
    app = new Application({ mainScreen: 'main' })
  })

  describe('constructor', () => {
    it('기본 옵션으로 생성할 수 있다', () => {
      const defaultApp = new Application()
      expect(defaultApp.mainScreen).toBeNull()
      expect(defaultApp.resources).toBeDefined()
    })

    it('mainScreen 옵션을 설정할 수 있다', () => {
      expect(app.mainScreen).toBe('main')
    })
  })

  describe('load()', () => {
    it('willLoad와 didLoad를 순서대로 호출한다', () => {
      const willLoadSpy = vi.spyOn(app, 'willLoad')
      const didLoadSpy = vi.spyOn(app, 'didLoad')

      app.load('arg1', 'arg2')

      expect(willLoadSpy).toHaveBeenCalledWith('arg1', 'arg2')
      expect(didLoadSpy).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('willLoad와 didLoad 이벤트를 발생시킨다', () => {
      const willLoadHandler = vi.fn()
      const didLoadHandler = vi.fn()
      app.event.on('willLoad', willLoadHandler)
      app.event.on('didLoad', didLoadHandler)

      app.load('arg1')

      expect(willLoadHandler).toHaveBeenCalledWith('arg1')
      expect(didLoadHandler).toHaveBeenCalledWith('arg1')
    })
  })

  describe('render()', () => {
    it('화면을 지우고 렌더링을 수행한다', () => {
      const mockContext = {
        clearRect: vi.fn()
      }
      const mockCanvas = { width: 800, height: 600 }
      const screens = {
        main: { context: mockContext, canvas: mockCanvas }
      }

      app.render(screens)

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })

    it('존재하지 않는 mainScreen에서 크래시하지 않는다', () => {
      const app = new Application({ mainScreen: 'nonexistent' })
      const screens = {
        main: {
          context: { clearRect: vi.fn() },
          canvas: { width: 800, height: 600 }
        }
      }

      expect(() => app.render(screens)).not.toThrow()
    })

    it('mainScreen이 null일 때 크래시하지 않는다', () => {
      const app = new Application({ mainScreen: null })
      const screens = {}

      expect(() => app.render(screens)).not.toThrow()
    })
  })
})

describe('SceneApplication', () => {
  let app

  beforeEach(() => {
    app = new SceneApplication()
  })

  describe('push()', () => {
    it('씬을 큐에 추가한다', () => {
      const scene = { name: 'TestScene' }

      app.push(scene, 'arg1', 'arg2')

      expect(app.queue).toHaveLength(1)
      expect(app.queue[0]).toEqual({
        type: 'push',
        scene,
        args: ['arg1', 'arg2']
      })
    })

    it('인자 없이 씬을 추가할 수 있다', () => {
      const scene = { name: 'TestScene' }

      app.push(scene)

      expect(app.queue[0].args).toEqual([])
    })
  })

  describe('pop()', () => {
    it('pop 명령을 큐에 추가한다', () => {
      app.pop('exitArg1', 'exitArg2')

      expect(app.queue).toHaveLength(1)
      expect(app.queue[0]).toEqual({
        type: 'pop',
        args: ['exitArg1', 'exitArg2']
      })
    })

    it('인자 없이 pop할 수 있다', () => {
      app.pop()

      expect(app.queue[0].args).toEqual([])
    })
  })

  describe('transit()', () => {
    it('pop과 push를 순서대로 큐에 추가한다', () => {
      const newScene = { name: 'NewScene' }

      app.transit(newScene, {
        exitArgs: ['exit1'],
        enterArgs: ['enter1', 'enter2']
      })

      expect(app.queue).toHaveLength(2)
      expect(app.queue[0]).toEqual({
        type: 'pop',
        args: ['exit1']
      })
      expect(app.queue[1]).toEqual({
        type: 'push',
        scene: newScene,
        args: ['enter1', 'enter2']
      })
    })

    it('기본 옵션으로 transit할 수 있다', () => {
      const newScene = { name: 'NewScene' }

      app.transit(newScene)

      expect(app.queue).toHaveLength(2)
      expect(app.queue[0].args).toEqual([])
      expect(app.queue[1].args).toEqual([])
    })
  })

  describe('update()', () => {
    it('큐에서 push 명령을 처리하고 씬을 생성한다', () => {
      const scene = {
        create: vi.fn(),
        handleUIEvent: vi.fn(),
        update: vi.fn()
      }

      app.push(scene, 'arg1')
      app.update(16, {})

      expect(scene.create).toHaveBeenCalledWith('arg1')
      expect(scene.application).toBe(app)
      expect(app.scenes).toContain(scene)
      expect(app.queue).toHaveLength(0)
    })

    it('큐에서 pop 명령을 처리하고 씬을 제거한다', () => {
      const scene = {
        create: vi.fn(),
        destroy: vi.fn(),
        handleUIEvent: vi.fn(),
        update: vi.fn()
      }

      app.push(scene)
      app.update(16, {})

      app.pop('exitArg')
      app.update(16, {})

      expect(scene.destroy).toHaveBeenCalledWith('exitArg')
      expect(scene.application).toBeNull()
      expect(app.scenes).not.toContain(scene)
    })

    it('여러 큐 명령을 순차적으로 처리한다', () => {
      const scene1 = { create: vi.fn(), handleUIEvent: vi.fn(), update: vi.fn() }
      const scene2 = { create: vi.fn(), handleUIEvent: vi.fn(), update: vi.fn() }

      app.push(scene1, 'first')
      app.push(scene2, 'second')
      app.update(16, {})

      expect(scene1.create).toHaveBeenCalledWith('first')
      expect(scene2.create).toHaveBeenCalledWith('second')
      expect(app.scenes).toHaveLength(2)
    })

    it('현재 씬의 handleUIEvent를 호출한다', () => {
      const scene = {
        create: vi.fn(),
        handleUIEvent: vi.fn(),
        update: vi.fn()
      }
      const events = { click: true }

      app.push(scene)
      app.update(16, events)

      expect(scene.handleUIEvent).toHaveBeenCalledWith(events)
    })

    it('현재 씬의 update를 호출한다', () => {
      const scene = {
        create: vi.fn(),
        handleUIEvent: vi.fn(),
        update: vi.fn()
      }

      app.push(scene)
      app.update(16, {})

      expect(scene.update).toHaveBeenCalledWith(16, {})
    })

    it('씬이 없을 때도 에러 없이 동작한다', () => {
      expect(() => app.update(16, {})).not.toThrow()
    })

    it('willUpdate와 didUpdate를 호출한다', () => {
      const willUpdateSpy = vi.spyOn(app, 'willUpdate')
      const didUpdateSpy = vi.spyOn(app, 'didUpdate')

      app.update(16, {})

      expect(willUpdateSpy).toHaveBeenCalledWith(16, {})
      expect(didUpdateSpy).toHaveBeenCalledWith(16, {})
    })
  })

  describe('render()', () => {
    it('화면을 지우고 현재 씬을 렌더링한다', () => {
      const mockContext = { clearRect: vi.fn() }
      const mockCanvas = { width: 800, height: 600 }
      const screens = {
        main: { context: mockContext, canvas: mockCanvas }
      }
      app.mainScreen = 'main'

      const scene = {
        create: vi.fn(),
        handleUIEvent: vi.fn(),
        update: vi.fn(),
        render: vi.fn()
      }

      app.push(scene)
      app.update(16, {})
      app.render(screens)

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600)
      expect(scene.render).toHaveBeenCalledWith(mockContext, screens.main, screens)
    })

    it('willRender와 didRender를 호출한다', () => {
      const mockContext = { clearRect: vi.fn() }
      const mockCanvas = { width: 800, height: 600 }
      const screens = {
        main: { context: mockContext, canvas: mockCanvas }
      }
      app.mainScreen = 'main'

      const willRenderSpy = vi.spyOn(app, 'willRender')
      const didRenderSpy = vi.spyOn(app, 'didRender')

      app.render(screens)

      expect(willRenderSpy).toHaveBeenCalled()
      expect(didRenderSpy).toHaveBeenCalled()
    })

    it('씬이 없을 때도 에러 없이 동작한다', () => {
      const mockContext = { clearRect: vi.fn() }
      const mockCanvas = { width: 800, height: 600 }
      const screens = {
        main: { context: mockContext, canvas: mockCanvas }
      }
      app.mainScreen = 'main'

      expect(() => app.render(screens)).not.toThrow()
    })

    it('존재하지 않는 mainScreen에서 크래시하지 않는다', () => {
      const app = new SceneApplication({ mainScreen: 'nonexistent' })
      const screens = {}

      expect(() => app.render(screens)).not.toThrow()
    })
  })
})
