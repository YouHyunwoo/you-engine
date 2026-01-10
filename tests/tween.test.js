import { describe, it, expect, vi } from 'vitest'
import { Tween } from '../you/animation/tween.js'
import { Easing } from '../you/animation/easing.js'


describe('Tween', () => {

	describe('constructor', () => {
		it('필수 옵션 없이 생성하면 에러를 던진다', () => {
			expect(() => new Tween({})).toThrow('target is required')
			expect(() => new Tween({ target: {} })).toThrow('property is required')
			expect(() => new Tween({ target: {}, property: 'x' })).toThrow('to is required')
		})

		it('기본값으로 생성된다', () => {
			const target = { x: 0 }
			const tween = new Tween({ target, property: 'x', to: 100 })

			expect(tween.duration).toBe(1000)
			expect(tween.easing).toBe(Easing.linear)
			expect(tween.from).toBeNull()
		})
	})

	describe('숫자 보간', () => {
		it('from에서 to까지 보간한다', () => {
			const target = { x: 0 }
			const tween = new Tween({
				target,
				property: 'x',
				from: 0,
				to: 100,
				duration: 1000
			})

			tween.update(500) // 50%
			expect(target.x).toBeCloseTo(50)

			tween.update(500) // 100%
			expect(target.x).toBe(100)
		})

		it('from 생략시 현재값에서 시작한다', () => {
			const target = { x: 50 }
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000
			})

			tween.update(500) // 50%
			expect(target.x).toBeCloseTo(75) // 50 + (100-50)*0.5
		})
	})

	describe('배열 보간', () => {
		it('배열 요소별로 보간한다', () => {
			const target = { position: [0, 0] }
			const tween = new Tween({
				target,
				property: 'position',
				from: [0, 0],
				to: [100, 200],
				duration: 1000
			})

			tween.update(500) // 50%
			expect(target.position[0]).toBeCloseTo(50)
			expect(target.position[1]).toBeCloseTo(100)
		})

		it('from 생략시 현재 배열값을 복사한다', () => {
			const target = { position: [10, 20] }
			const tween = new Tween({
				target,
				property: 'position',
				to: [110, 120],
				duration: 1000
			})

			tween.update(500)
			expect(target.position[0]).toBeCloseTo(60) // 10 + (110-10)*0.5
			expect(target.position[1]).toBeCloseTo(70) // 20 + (120-20)*0.5
		})
	})

	describe('이징', () => {
		it('이징 함수가 적용된다', () => {
			const target = { x: 0 }
			const tween = new Tween({
				target,
				property: 'x',
				from: 0,
				to: 100,
				duration: 1000,
				easing: Easing.easeInQuad
			})

			tween.update(500) // 50%
			// easeInQuad(0.5) = 0.25
			expect(target.x).toBeCloseTo(25)
		})
	})

	describe('progress', () => {
		it('진행률을 반환한다', () => {
			const target = { x: 0 }
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000
			})

			expect(tween.progress).toBe(0)

			tween.update(300)
			expect(tween.progress).toBeCloseTo(0.3)

			tween.update(700)
			expect(tween.progress).toBe(1)
		})

		it('1을 넘지 않는다', () => {
			const target = { x: 0 }
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000
			})

			tween.update(2000)
			expect(tween.progress).toBe(1)
		})
	})

	describe('이벤트', () => {
		it('onUpdate 콜백이 호출된다', () => {
			const target = { x: 0 }
			const onUpdate = vi.fn()
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000,
				onUpdate
			})

			tween.update(500)

			expect(onUpdate).toHaveBeenCalledWith(50, 0.5)
		})

		it('onFinish 콜백이 완료시 호출된다', () => {
			const target = { x: 0 }
			const onFinish = vi.fn()
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000,
				onFinish
			})

			tween.update(500)
			expect(onFinish).not.toHaveBeenCalled()

			tween.update(500)
			expect(onFinish).toHaveBeenCalledWith(100)
		})
	})

	describe('finish()', () => {
		it('완료시 procedure에 finish를 호출한다', () => {
			const target = { x: 0 }
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000
			})

			const mockProcedure = { finish: vi.fn() }
			tween.procedure = mockProcedure

			tween.update(1000)

			expect(mockProcedure.finish).toHaveBeenCalledWith(tween)
		})
	})

	describe('reset()', () => {
		it('트윈을 초기 상태로 되돌린다', () => {
			const target = { x: 0 }
			const tween = new Tween({
				target,
				property: 'x',
				from: 0,
				to: 100,
				duration: 1000
			})

			tween.update(1000)
			expect(target.x).toBe(100)

			tween.reset()
			target.x = 0

			tween.update(500)
			expect(target.x).toBeCloseTo(50)
		})
	})

	describe('완료 후', () => {
		it('완료 후 update를 호출해도 아무 일도 안 일어난다', () => {
			const target = { x: 0 }
			const onUpdate = vi.fn()
			const tween = new Tween({
				target,
				property: 'x',
				to: 100,
				duration: 1000,
				onUpdate
			})

			tween.update(1000)
			onUpdate.mockClear()

			tween.update(1000)
			expect(onUpdate).not.toHaveBeenCalled()
		})
	})
})
