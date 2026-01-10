import { Component } from "../component.js";
import { Easing } from "./easing.js";


/**
 * 트윈 컴포넌트
 *
 * Object에 부착하여 트윈 애니메이션을 실행한다.
 * target은 자동으로 this.object가 된다.
 *
 * @example
 * const player = new Object({
 *   position: [0, 0],
 *   components: [new TweenComponent()]
 * });
 *
 * player.findComponent(TweenComponent).run({
 *   property: 'position',
 *   to: [100, 200],
 *   duration: 1000,
 *   easing: Easing.easeOutQuad
 * });
 */
export class TweenComponent extends Component {

	constructor(options = {}) {
		super(options);

		this._tweens = [];
	}

	/**
	 * 트윈 실행
	 */
	run({
		property,
		from = null,
		to,
		duration = 1000,
		easing = Easing.linear,
		onUpdate = null,
		onFinish = null,
	}) {
		if (!property) throw new Error('TweenComponent.run: property is required');
		if (to === undefined) throw new Error('TweenComponent.run: to is required');

		const tween = {
			property,
			from,
			to,
			duration,
			easing,
			onUpdate,
			onFinish,
			elapsed: 0,
			started: false,
			finished: false,
		};

		this._tweens.push(tween);

		return this;
	}

	/**
	 * 특정 속성의 트윈 정지
	 */
	stop(property) {
		this._tweens = this._tweens.filter(t => t.property !== property);
		return this;
	}

	/**
	 * 모든 트윈 정지
	 */
	stopAll() {
		this._tweens = [];
		return this;
	}

	/**
	 * 실행 중인 트윈이 있는지
	 */
	get running() {
		return this._tweens.length > 0;
	}

	willUpdate(deltaTime, events, input) {
		if (!this.object) return;

		for (let i = this._tweens.length - 1; i >= 0; i--) {
			const tween = this._tweens[i];

			// 첫 업데이트 시 from 값 설정
			if (!tween.started) {
				tween.started = true;
				if (tween.from === null) {
					tween.from = this._getValue(tween.property);
				}
			}

			tween.elapsed += deltaTime;

			const progress = Math.min(tween.elapsed / tween.duration, 1);
			const easedProgress = tween.easing(progress);

			// 값 보간
			const value = this._interpolate(tween.from, tween.to, easedProgress);
			this._setValue(tween.property, value);

			if (tween.onUpdate) {
				tween.onUpdate(value, progress);
			}

			// 완료 체크
			if (tween.elapsed >= tween.duration) {
				this._setValue(tween.property, tween.to);

				if (tween.onFinish) {
					tween.onFinish(tween.to);
				}

				this._tweens.splice(i, 1);
			}
		}
	}

	_getValue(property) {
		const value = this.object[property];
		if (Array.isArray(value)) {
			return [...value];
		}
		return value;
	}

	_setValue(property, value) {
		this.object[property] = value;
	}

	_interpolate(from, to, t) {
		if (Array.isArray(from) && Array.isArray(to)) {
			return from.map((v, i) => v + (to[i] - v) * t);
		}
		return from + (to - from) * t;
	}
}
