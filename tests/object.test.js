import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Object } from '../you/object.js'
import { Component } from '../you/component.js'

describe('Object (Game Object)', () => {
  describe('constructor', () => {
    it('기본값으로 초기화한다', () => {
      const obj = new Object()

      expect(obj.name).toBe('')
      expect(obj.tags.size).toBe(0)
      expect(obj.components).toHaveLength(0)
      expect(obj.objects).toHaveLength(0)
      expect(obj.parent).toBeNull()
    })

    it('옵션으로 초기화한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({
        name: 'player',
        tags: ['enemy', 'unit'],
        components: [component],
        objects: [child]
      })

      expect(obj.name).toBe('player')
      expect(obj.tags.has('enemy')).toBe(true)
      expect(obj.tags.has('unit')).toBe(true)
      expect(obj.components).toContain(component)
      expect(obj.objects).toContain(child)
    })
  })

  describe('root', () => {
    it('parent가 없으면 null을 반환한다', () => {
      const obj = new Object()
      expect(obj.root).toBeNull()
    })

    it('parent가 있으면 root를 반환한다', () => {
      const grandparent = new Object()
      const parent = new Object()
      const child = new Object()

      grandparent.add(parent)
      parent.add(child)

      expect(child.root).toBe(grandparent)
    })
  })

  describe('create()', () => {
    it('컴포넌트와 자식 오브젝트도 create한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })

      // Component와 child의 create를 감시
      const componentCreate = vi.spyOn(component, 'create')
      const childCreate = vi.spyOn(child, 'create')

      obj.create()

      expect(componentCreate).toHaveBeenCalled()
      expect(childCreate).toHaveBeenCalled()
    })
  })

  describe('destroy()', () => {
    it('컴포넌트와 자식 오브젝트도 destroy한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })

      obj.create()

      const componentDestroy = vi.spyOn(component, 'destroy')
      const childDestroy = vi.spyOn(child, 'destroy')

      obj.destroy()

      expect(componentDestroy).toHaveBeenCalled()
      expect(childDestroy).toHaveBeenCalled()
    })

    it('parent에서 자신을 제거한다', () => {
      const parent = new Object()
      const child = new Object()
      parent.add(child)
      parent.create()

      child.destroy()

      expect(parent.objects).not.toContain(child)
      expect(child.parent).toBeNull()
    })
  })

  describe('update()', () => {
    it('컴포넌트와 자식 오브젝트도 update한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })
      obj.create()

      const componentUpdate = vi.spyOn(component, 'update')
      const childUpdate = vi.spyOn(child, 'update')

      obj.update(16, {}, {})

      expect(componentUpdate).toHaveBeenCalled()
      expect(childUpdate).toHaveBeenCalled()
    })
  })

  describe('render()', () => {
    it('컴포넌트와 자식 오브젝트도 render한다', () => {
      const component = new Component()
      const child = new Object()
      const obj = new Object({ components: [component], objects: [child] })
      obj.create()

      const componentRender = vi.spyOn(component, 'render')
      const childRender = vi.spyOn(child, 'render')

      obj.render({}, {}, {})

      expect(componentRender).toHaveBeenCalled()
      expect(childRender).toHaveBeenCalled()
    })
  })

  describe('add()', () => {
    it('자식 오브젝트를 추가한다', () => {
      const parent = new Object()
      const child = new Object()

      parent.add(child)

      expect(parent.objects).toContain(child)
      expect(child.parent).toBe(parent)
    })

    it('null/undefined를 추가하면 에러를 던진다', () => {
      const parent = new Object()

      expect(() => parent.add(null)).toThrow()
      expect(() => parent.add(undefined)).toThrow()
    })

    it('CREATED 상태이면 추가된 자식도 create한다', () => {
      const parent = new Object()
      parent.create()
      const child = new Object()

      parent.add(child)

      expect(child.created).toBe(true)
    })
  })

  describe('remove()', () => {
    it('자식 오브젝트를 제거한다', () => {
      const parent = new Object()
      const child = new Object()
      parent.add(child)

      const removed = parent.remove(child)

      expect(removed).toBe(child)
      expect(parent.objects).not.toContain(child)
      expect(child.parent).toBeNull()
    })

    it('존재하지 않는 오브젝트를 제거하면 null을 반환한다', () => {
      const parent = new Object()
      const notChild = new Object()

      const result = parent.remove(notChild)

      expect(result).toBeNull()
    })

    it('CREATED 상태이면 제거된 자식을 destroy한다', () => {
      const parent = new Object()
      const child = new Object()
      parent.add(child)
      parent.create()

      parent.remove(child)

      expect(child.destroyed).toBe(true)
    })
  })

  describe('find()', () => {
    it('이름으로 자식 오브젝트를 찾는다', () => {
      const parent = new Object()
      const child = new Object({ name: 'target' })
      parent.add(child)

      expect(parent.find('target')).toBe(child)
    })

    it('찾지 못하면 null을 반환한다', () => {
      const parent = new Object()

      expect(parent.find('nonexistent')).toBeNull()
    })
  })

  describe('findAll()', () => {
    it('같은 이름의 모든 자식을 찾는다', () => {
      const parent = new Object()
      const child1 = new Object({ name: 'target' })
      const child2 = new Object({ name: 'target' })
      const child3 = new Object({ name: 'other' })
      parent.add(child1)
      parent.add(child2)
      parent.add(child3)

      const found = parent.findAll('target')

      expect(found).toHaveLength(2)
      expect(found).toContain(child1)
      expect(found).toContain(child2)
    })
  })

  describe('findByTags()', () => {
    it('태그로 자식 오브젝트를 찾는다', () => {
      const parent = new Object()
      const child1 = new Object({ tags: ['enemy', 'unit'] })
      const child2 = new Object({ tags: ['ally', 'unit'] })
      parent.add(child1)
      parent.add(child2)

      const found = parent.findByTags(['enemy'])

      expect(found).toHaveLength(1)
      expect(found).toContain(child1)
    })

    it('여러 태그 조건을 OR로 검색한다', () => {
      const parent = new Object()
      const child1 = new Object({ tags: ['enemy'] })
      const child2 = new Object({ tags: ['ally'] })
      parent.add(child1)
      parent.add(child2)

      const found = parent.findByTags(['enemy'], ['ally'])

      expect(found).toHaveLength(2)
    })
  })

  describe('addComponent()', () => {
    it('컴포넌트를 추가한다', () => {
      const obj = new Object()
      const component = new Component()

      obj.addComponent(component)

      expect(obj.components).toContain(component)
      expect(component.object).toBe(obj)
    })
  })

  describe('removeComponent()', () => {
    it('컴포넌트를 제거한다', () => {
      const obj = new Object()
      const component = new Component()
      obj.addComponent(component)

      obj.removeComponent(component)

      expect(obj.components).not.toContain(component)
      expect(component.object).toBeNull()
    })
  })

  describe('findComponent()', () => {
    it('타입으로 컴포넌트를 찾는다', () => {
      const obj = new Object()
      const component = new Component()
      obj.addComponent(component)

      expect(obj.findComponent(Component)).toBe(component)
    })

    it('찾지 못하고 requirement=true이면 에러를 던진다', () => {
      const obj = new Object()

      expect(() => obj.findComponent(Component, true)).toThrow()
    })
  })

  describe('findAllComponent()', () => {
    it('타입의 모든 컴포넌트를 찾는다', () => {
      const obj = new Object()
      const comp1 = new Component()
      const comp2 = new Component()
      obj.addComponent(comp1)
      obj.addComponent(comp2)

      const found = obj.findAllComponent(Component)

      expect(found).toHaveLength(2)
    })

    it('찾지 못하고 requirement=true이면 에러를 던진다', () => {
      const obj = new Object()

      expect(() => obj.findAllComponent(Component, true)).toThrow()
    })
  })
})
