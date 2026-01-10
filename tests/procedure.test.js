import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Task, Parallel, Procedure } from '../you/utilities/procedure.js'

describe('Task', () => {
  it('모듈이 정상적으로 import된다', () => {
    expect(Task).toBeDefined()
    expect(Parallel).toBeDefined()
    expect(Procedure).toBeDefined()
  })

  it('Task 인스턴스를 생성할 수 있다', () => {
    const task = new Task()
    expect(task).toBeInstanceOf(Task)
    expect(task.procedure).toBeNull()
  })

  it('finish()를 호출하면 procedure.finish()가 호출된다', () => {
    const task = new Task()
    const mockProcedure = { finish: vi.fn() }
    task.procedure = mockProcedure

    task.finish()

    expect(mockProcedure.finish).toHaveBeenCalledWith(task)
  })

  it('procedure가 없을 때 finish()를 호출해도 에러가 발생하지 않는다', () => {
    const task = new Task()

    expect(() => task.finish()).not.toThrow()
  })
})

describe('Procedure', () => {
  it('tasks 배열로 초기화할 수 있다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const procedure = new Procedure([task1, task2])

    expect(procedure.tasks).toHaveLength(2)
    expect(task1.procedure).toBe(procedure)
    expect(task2.procedure).toBe(procedure)
  })

  it('배열 형태의 task는 Parallel로 변환된다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const procedure = new Procedure([[task1, task2]])

    expect(procedure.tasks).toHaveLength(1)
    expect(procedure.tasks[0]).toBeInstanceOf(Parallel)
  })

  it('finish()가 호출되면 다음 task로 이동한다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const procedure = new Procedure([task1, task2])

    expect(procedure.currentTaskIndex).toBe(0)

    procedure.finish(task1)

    expect(procedure.currentTaskIndex).toBe(1)
  })

  it('모든 task가 완료되면 finish 이벤트가 발생한다', () => {
    const task1 = new Task()
    const procedure = new Procedure([task1])
    const finishHandler = vi.fn()
    procedure.event.on('finish', finishHandler)

    procedure.finish(task1)

    expect(finishHandler).toHaveBeenCalled()
  })

  describe('currentTaskIndex', () => {
    it('finish 후 currentTaskIndex가 증가한다', () => {
      const task1 = new Task()
      const task2 = new Task()
      const procedure = new Procedure([task1, task2])

      expect(procedure.currentTaskIndex).toBe(0)
      procedure.finish(task1)
      expect(procedure.currentTaskIndex).toBe(1)
    })

    it('마지막 task가 완료되면 인덱스가 tasks.length와 같아진다', () => {
      const task = new Task()
      const procedure = new Procedure([task])

      procedure.finish(task)
      expect(procedure.currentTaskIndex).toBe(procedure.tasks.length)
    })
  })

  describe('add()', () => {
    it('task를 추가할 수 있다', () => {
      const procedure = new Procedure([])
      const task = new Task()

      procedure.add(task)

      expect(procedure.tasks).toContain(task)
      expect(task.procedure).toBe(procedure)
    })

    it('null을 추가하면 무시된다', () => {
      const procedure = new Procedure([])

      procedure.add(null)

      expect(procedure.tasks).toHaveLength(0)
    })
  })

  describe('remove()', () => {
    it('task를 제거할 수 있다', () => {
      const task = new Task()
      const procedure = new Procedure([task])

      procedure.remove(task)

      expect(procedure.tasks).not.toContain(task)
      expect(task.procedure).toBeNull()
    })

    it('null을 제거하면 무시된다', () => {
      const task = new Task()
      const procedure = new Procedure([task])

      procedure.remove(null)

      expect(procedure.tasks).toHaveLength(1)
    })

    it('존재하지 않는 task를 제거하면 무시된다', () => {
      const task1 = new Task()
      const task2 = new Task()
      const procedure = new Procedure([task1])

      procedure.remove(task2)

      expect(procedure.tasks).toHaveLength(1)
    })
  })
})

describe('Parallel', () => {
  it('여러 task를 병렬로 관리한다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const parallel = new Parallel([task1, task2])

    expect(parallel.tasks).toHaveLength(2)
    expect(parallel.finished).toEqual([false, false])
  })

  it('각 task의 procedure를 Parallel로 설정한다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const parallel = new Parallel([task1, task2])

    expect(task1.procedure).toBe(parallel)
    expect(task2.procedure).toBe(parallel)
  })

  it('task가 finish되면 해당 task만 완료 표시된다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const parallel = new Parallel([task1, task2])

    parallel.finish(task1)

    expect(parallel.finished).toEqual([true, false])
  })

  it('모든 task가 finish되면 procedure.finish()가 호출된다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const parallel = new Parallel([task1, task2])
    const mockProcedure = { finish: vi.fn() }
    parallel.procedure = mockProcedure

    parallel.finish(task1)
    expect(mockProcedure.finish).not.toHaveBeenCalled()

    parallel.finish(task2)
    expect(mockProcedure.finish).toHaveBeenCalledWith(parallel)
  })

  describe('finished tracking', () => {
    it('모든 task가 완료되면 상위 procedure.finish()가 호출된다', () => {
      const task1 = new Task()
      const task2 = new Task()
      const parallel = new Parallel([task1, task2])
      const mockProcedure = { finish: vi.fn() }
      parallel.procedure = mockProcedure

      parallel.finish(task1)
      expect(parallel.finished).toEqual([true, false])
      expect(mockProcedure.finish).not.toHaveBeenCalled()

      parallel.finish(task2)
      expect(parallel.finished).toEqual([true, true])
      expect(mockProcedure.finish).toHaveBeenCalledWith(parallel)
    })

    it('단일 task가 완료되면 바로 상위 procedure.finish()가 호출된다', () => {
      const task = new Task()
      const parallel = new Parallel([task])
      const mockProcedure = { finish: vi.fn() }
      parallel.procedure = mockProcedure

      parallel.finish(task)

      expect(parallel.finished).toEqual([true])
      expect(mockProcedure.finish).toHaveBeenCalledWith(parallel)
    })

    it('procedure가 없어도 에러 없이 완료 처리된다', () => {
      const task = new Task()
      const parallel = new Parallel([task])

      expect(() => parallel.finish(task)).not.toThrow()
      expect(parallel.finished).toEqual([true])
    })
  })
})
