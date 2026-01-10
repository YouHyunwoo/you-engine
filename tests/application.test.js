import { describe, it, expect, beforeEach } from 'vitest'
import { SceneApplication } from '../you/application.js'

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
  })
})
