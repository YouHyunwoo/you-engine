import { describe, it, expect, vi } from 'vitest'
import { TweenComponent } from '../you/animation/tween-component.js'
import { Easing } from '../you/animation/easing.js'


describe('TweenComponent', () => {

	const createMockObject = (props = {}) => ({
		created: true,
		...props
	})

	describe('constructor', () => {
		it('빈 트윈 목록으로 생성된다', () => {
			const component = new TweenComponent()
			expect(component.running).toBe(false)
		})
	})

	describe('run()', () => {
		it('필수 옵션 없이 호출하면 에러를 던진다', () => {
			const component = new TweenComponent()
			expect(() => component.run({})).toThrow('property is required')
			expect(() => component.run({ property: 'x' })).toThrow('to is required')
		})

		it('트윈을 추가한다', () => {
			const component = new TweenComponent()
			component.run({ property: 'x', to: 100 })

			expect(component.running).toBe(true)
		})

		it('체이닝을 지원한다', () => {
			const component = new TweenComponent()
			const result = component.run({ property: 'x', to: 100 })

			expect(result).toBe(component)
		})
	})

	describe('숫자 보간', () => {
		it('object의 속성을 보간한다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0 })

			component.run({
				property: 'x',
				to: 100,
				duration: 1000
			})

			component.willUpdate(500)
			expect(component.object.x).toBeCloseTo(50)

			component.willUpdate(500)
			expect(component.object.x).toBe(100)
		})
	})

	describe('배열 보간', () => {
		it('배열 속성을 요소별로 보간한다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ position: [0, 0] })

			component.run({
				property: 'position',
				to: [100, 200],
				duration: 1000
			})

			component.willUpdate(500)
			expect(component.object.position[0]).toBeCloseTo(50)
			expect(component.object.position[1]).toBeCloseTo(100)
		})
	})

	describe('이징', () => {
		it('이징 함수가 적용된다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0 })

			component.run({
				property: 'x',
				to: 100,
				duration: 1000,
				easing: Easing.easeInQuad
			})

			component.willUpdate(500)
			expect(component.object.x).toBeCloseTo(25)
		})
	})

	describe('콜백', () => {
		it('onUpdate 콜백이 호출된다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0 })

			const onUpdate = vi.fn()
			component.run({
				property: 'x',
				to: 100,
				duration: 1000,
				onUpdate
			})

			component.willUpdate(500)
			expect(onUpdate).toHaveBeenCalledWith(50, 0.5)
		})

		it('onFinish 콜백이 완료시 호출된다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0 })

			const onFinish = vi.fn()
			component.run({
				property: 'x',
				to: 100,
				duration: 1000,
				onFinish
			})

			component.willUpdate(1000)
			expect(onFinish).toHaveBeenCalledWith(100)
		})
	})

	describe('stop()', () => {
		it('특정 속성의 트윈을 정지한다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0, y: 0 })

			component.run({ property: 'x', to: 100, duration: 1000 })
			component.run({ property: 'y', to: 200, duration: 1000 })

			component.stop('x')
			component.willUpdate(500)

			expect(component.object.x).toBe(0) // 정지됨
			expect(component.object.y).toBeCloseTo(100) // 계속 진행
		})

		it('체이닝을 지원한다', () => {
			const component = new TweenComponent()
			const result = component.stop('x')
			expect(result).toBe(component)
		})
	})

	describe('stopAll()', () => {
		it('모든 트윈을 정지한다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0, y: 0 })

			component.run({ property: 'x', to: 100, duration: 1000 })
			component.run({ property: 'y', to: 200, duration: 1000 })

			component.stopAll()

			expect(component.running).toBe(false)
		})

		it('체이닝을 지원한다', () => {
			const component = new TweenComponent()
			const result = component.stopAll()
			expect(result).toBe(component)
		})
	})

	describe('running', () => {
		it('트윈이 실행 중이면 true', () => {
			const component = new TweenComponent()
			component.run({ property: 'x', to: 100, duration: 1000 })

			expect(component.running).toBe(true)
		})

		it('트윈이 완료되면 false', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0 })
			component.run({ property: 'x', to: 100, duration: 1000 })

			component.willUpdate(1000)

			expect(component.running).toBe(false)
		})
	})

	describe('여러 트윈 동시 실행', () => {
		it('여러 속성을 동시에 보간한다', () => {
			const component = new TweenComponent()
			component.object = createMockObject({ x: 0, y: 0, alpha: 1 })

			component.run({ property: 'x', to: 100, duration: 1000 })
			component.run({ property: 'y', to: 200, duration: 1000 })
			component.run({ property: 'alpha', to: 0, duration: 500 })

			component.willUpdate(500)

			expect(component.object.x).toBeCloseTo(50)
			expect(component.object.y).toBeCloseTo(100)
			expect(component.object.alpha).toBe(0) // 완료
		})
	})

	describe('object가 없을 때', () => {
		it('object가 없으면 아무 일도 안 일어난다', () => {
			const component = new TweenComponent()
			component.run({ property: 'x', to: 100, duration: 1000 })

			expect(() => component.willUpdate(500)).not.toThrow()
		})
	})
})
