/**
 * 이징 함수 모음
 *
 * 모든 함수는 0~1 사이의 진행률(t)을 받아 변환된 값을 반환한다.
 * - easeIn: 천천히 시작
 * - easeOut: 천천히 끝
 * - easeInOut: 천천히 시작하고 천천히 끝
 */
export const Easing = {

	// === Linear ===
	linear: t => t,

	// === Quad (2차) ===
	easeInQuad: t => t * t,
	easeOutQuad: t => t * (2 - t),
	easeInOutQuad: t => t < 0.5
		? 2 * t * t
		: -1 + (4 - 2 * t) * t,

	// === Cubic (3차) ===
	easeInCubic: t => t * t * t,
	easeOutCubic: t => (--t) * t * t + 1,
	easeInOutCubic: t => t < 0.5
		? 4 * t * t * t
		: (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

	// === Sine (사인) ===
	easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
	easeOutSine: t => Math.sin(t * Math.PI / 2),
	easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

	// === Elastic (탄성) ===
	easeInElastic: t => {
		if (t === 0 || t === 1) return t;
		return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3);
	},
	easeOutElastic: t => {
		if (t === 0 || t === 1) return t;
		return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
	},
	easeInOutElastic: t => {
		if (t === 0 || t === 1) return t;
		return t < 0.5
			? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2
			: (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1;
	},

	// === Bounce (바운스) ===
	easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
	easeOutBounce: t => {
		const n1 = 7.5625;
		const d1 = 2.75;
		if (t < 1 / d1) {
			return n1 * t * t;
		} else if (t < 2 / d1) {
			return n1 * (t -= 1.5 / d1) * t + 0.75;
		} else if (t < 2.5 / d1) {
			return n1 * (t -= 2.25 / d1) * t + 0.9375;
		} else {
			return n1 * (t -= 2.625 / d1) * t + 0.984375;
		}
	},
	easeInOutBounce: t => t < 0.5
		? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
		: (1 + Easing.easeOutBounce(2 * t - 1)) / 2,

	// === Back (오버슈트) ===
	easeInBack: t => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return c3 * t * t * t - c1 * t * t;
	},
	easeOutBack: t => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
	},
	easeInOutBack: t => {
		const c1 = 1.70158;
		const c2 = c1 * 1.525;
		return t < 0.5
			? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
			: (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
	},
};
