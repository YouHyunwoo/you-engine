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
})

describe('Parallel', () => {
  it('여러 task를 병렬로 관리한다', () => {
    const task1 = new Task()
    const task2 = new Task()
    const parallel = new Parallel([task1, task2])

    expect(parallel.tasks).toHaveLength(2)
    expect(parallel.finished).toEqual([false, false])
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
})
