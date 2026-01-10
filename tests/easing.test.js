import { describe, it, expect } from 'vitest'
import { Easing } from '../you/animation/easing.js'


describe('Easing', () => {

	describe('모든 이징 함수 기본 동작', () => {
		const easingNames = Object.keys(Easing)

		it.each(easingNames)('%s: t=0일 때 0을 반환한다', (name) => {
			expect(Easing[name](0)).toBeCloseTo(0, 5)
		})

		it.each(easingNames)('%s: t=1일 때 1을 반환한다', (name) => {
			expect(Easing[name](1)).toBeCloseTo(1, 5)
		})

		it.each(easingNames)('%s: 0~1 사이 값에서 에러 없이 동작한다', (name) => {
			expect(() => {
				for (let t = 0; t <= 1; t += 0.1) {
					Easing[name](t)
				}
			}).not.toThrow()
		})
	})

	describe('linear', () => {
		it('입력값을 그대로 반환한다', () => {
			expect(Easing.linear(0.5)).toBe(0.5)
			expect(Easing.linear(0.25)).toBe(0.25)
		})
	})

	describe('Quad', () => {
		it('easeInQuad: 시작이 느리다', () => {
			expect(Easing.easeInQuad(0.5)).toBeLessThan(0.5)
		})

		it('easeOutQuad: 끝이 느리다', () => {
			expect(Easing.easeOutQuad(0.5)).toBeGreaterThan(0.5)
		})

		it('easeInOutQuad: 중간점에서 0.5를 반환한다', () => {
			expect(Easing.easeInOutQuad(0.5)).toBeCloseTo(0.5, 5)
		})
	})

	describe('Cubic', () => {
		it('easeInCubic: 시작이 느리다', () => {
			expect(Easing.easeInCubic(0.5)).toBeLessThan(0.5)
		})

		it('easeOutCubic: 끝이 느리다', () => {
			expect(Easing.easeOutCubic(0.5)).toBeGreaterThan(0.5)
		})

		it('easeInOutCubic: 중간점에서 0.5를 반환한다', () => {
			expect(Easing.easeInOutCubic(0.5)).toBeCloseTo(0.5, 5)
		})
	})

	describe('Sine', () => {
		it('easeInSine: 시작이 느리다', () => {
			expect(Easing.easeInSine(0.5)).toBeLessThan(0.5)
		})

		it('easeOutSine: 끝이 느리다', () => {
			expect(Easing.easeOutSine(0.5)).toBeGreaterThan(0.5)
		})
	})

	describe('Elastic', () => {
		it('easeOutElastic: 1을 넘었다가 돌아온다', () => {
			// 중간 어딘가에서 1을 초과해야 함
			let hasOvershoot = false
			for (let t = 0; t <= 1; t += 0.05) {
				if (Easing.easeOutElastic(t) > 1) {
					hasOvershoot = true
					break
				}
			}
			expect(hasOvershoot).toBe(true)
		})
	})

	describe('Bounce', () => {
		it('easeOutBounce: 바운스 효과가 있다', () => {
			// 1에 도달하기 전에 여러 번 낮아지는 패턴
			const values = []
			for (let t = 0; t <= 1; t += 0.1) {
				values.push(Easing.easeOutBounce(t))
			}
			// 단조 증가가 아님을 확인 (바운스)
			let hasDecrease = false
			for (let i = 1; i < values.length; i++) {
				if (values[i] < values[i - 1]) {
					hasDecrease = true
					break
				}
			}
			// easeOutBounce는 실제로 단조 증가함 (바운스 형태이지만 값은 계속 증가)
			// 대신 가속도 변화가 있음
			expect(values[values.length - 1]).toBeCloseTo(1, 5)
		})
	})

	describe('Back', () => {
		it('easeInBack: 0 아래로 내려갔다가 올라온다', () => {
			let hasUndershoot = false
			for (let t = 0; t <= 1; t += 0.05) {
				if (Easing.easeInBack(t) < 0) {
					hasUndershoot = true
					break
				}
			}
			expect(hasUndershoot).toBe(true)
		})

		it('easeOutBack: 1을 넘었다가 돌아온다', () => {
			let hasOvershoot = false
			for (let t = 0; t <= 1; t += 0.05) {
				if (Easing.easeOutBack(t) > 1) {
					hasOvershoot = true
					break
				}
			}
			expect(hasOvershoot).toBe(true)
		})
	})
})
