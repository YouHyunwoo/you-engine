import { describe, it, expect, vi } from 'vitest'
import { Progress } from '../you/utilities/progress.js'

describe('Progress', () => {
  describe('constructor', () => {
    it('기본값으로 생성', () => {
      const progress = new Progress()

      expect(progress.speed).toBe(1)
      expect(progress.repeat).toBe(false)
      expect(progress.value).toBe(0)
    })

    it('커스텀 값으로 생성', () => {
      const progress = new Progress(2, true)

      expect(progress.speed).toBe(2)
      expect(progress.repeat).toBe(true)
      expect(progress.value).toBe(0)
    })
  })

  describe('update 종료 조건', () => {
    it('정방향 진행 시 1 이상에서 종료', () => {
      const progress = new Progress(1, false)
      progress.value = 1

      const updateSpy = vi.fn()
      progress.event.on('update', updateSpy)

      progress.update(0.1)

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('역방향 진행 시 0 이하에서 종료', () => {
      const progress = new Progress(-1, false)
      progress.value = 0

      const updateSpy = vi.fn()
      progress.event.on('update', updateSpy)

      progress.update(0.1)

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('repeat가 true면 종료하지 않음', () => {
      const progress = new Progress(1, true)
      progress.value = 1

      const updateSpy = vi.fn()
      progress.event.on('update', updateSpy)

      progress.update(0.1)

      expect(updateSpy).toHaveBeenCalled()
    })
  })

  describe('update 정방향 진행', () => {
    it('delta 만큼 value 증가', () => {
      const progress = new Progress(1, false)

      progress.update(0.5)

      expect(progress.value).toBe(0.5)
    })

    it('speed 배율 적용', () => {
      const progress = new Progress(2, false)

      progress.update(0.3)

      expect(progress.value).toBe(0.6)
    })

    it('1 도달 시 finish 이벤트 발생', () => {
      const progress = new Progress(1, false)
      const finishSpy = vi.fn()
      progress.event.on('finish', finishSpy)

      progress.update(1.5)

      expect(progress.value).toBe(1)
      expect(finishSpy).toHaveBeenCalledOnce()
    })

    it('repeat 시 1 초과하면 exceed 이벤트 발생', () => {
      const progress = new Progress(1, true)
      const exceedSpy = vi.fn()
      progress.event.on('exceed', exceedSpy)

      progress.update(2.5)

      expect(progress.value).toBe(0.5)
      expect(exceedSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('update 역방향 진행', () => {
    it('음수 speed로 value 감소', () => {
      const progress = new Progress(-1, false)
      progress.value = 1

      progress.update(0.5)

      expect(progress.value).toBe(0.5)
    })

    it('0 도달 시 finish 이벤트 발생', () => {
      const progress = new Progress(-1, false)
      progress.value = 0.5
      const finishSpy = vi.fn()
      progress.event.on('finish', finishSpy)

      progress.update(1)

      expect(progress.value).toBe(0)
      expect(finishSpy).toHaveBeenCalledOnce()
    })

    it('repeat 시 0 미만이면 exceed 이벤트 발생', () => {
      const progress = new Progress(-1, true)
      progress.value = 0.5
      const exceedSpy = vi.fn()
      progress.event.on('exceed', exceedSpy)

      progress.update(2.5)

      expect(exceedSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('create 정적 메서드', () => {
    it('이벤트 핸들러와 함께 인스턴스 생성', () => {
      const updateFn = vi.fn()
      const finishFn = vi.fn()
      const exceedFn = vi.fn()

      const progress = Progress.create(2, true, updateFn, finishFn, exceedFn)

      expect(progress.speed).toBe(2)
      expect(progress.repeat).toBe(true)

      progress.update(0.5)
      expect(updateFn).toHaveBeenCalled()

      progress.update(1)
      expect(exceedFn).toHaveBeenCalled()
    })

    it('핸들러 없이 생성', () => {
      const progress = Progress.create(1, false)

      expect(progress).toBeInstanceOf(Progress)
    })
  })
})
