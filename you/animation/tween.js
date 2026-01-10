import { Task } from "../utilities/procedure.js";
import { EventEmitter } from "../utilities/event.js";
import { Easing } from "./easing.js";


/**
 * 트윈 애니메이션
 *
 * 시작값에서 끝값까지 시간에 따라 부드럽게 변화시킨다.
 * Task를 상속하여 Procedure와 호환된다.
 *
 * @example
 * const tween = new Tween({
 *   target: player,
 *   property: 'x',
 *   to: 100,
 *   duration: 500,
 *   easing: Easing.easeOutQuad
 * });
 */
export class Tween extends Task {

	constructor({
		target,
		property,
		from = null,
		to,
		duration = 1000,
		easing = Easing.linear,
		onUpdate = null,
		onFinish = null,
	}) {
		super();

		if (!target) throw new Error('Tween: target is required');
		if (!property) throw new Error('Tween: property is required');
		if (to === undefined) throw new Error('Tween: to is required');

		this.event = new EventEmitter(this);

		this.target = target;
		this.property = property;
		this.from = from;
		this.to = to;
		this.duration = duration;
		this.easing = easing;

		this._elapsed = 0;
		this._started = false;
		this._finished = false;

		if (onUpdate) this.event.on('update', onUpdate);
		if (onFinish) this.event.on('finish', onFinish);
	}

	get progress() {
		return Math.min(this._elapsed / this.duration, 1);
	}

	get easedProgress() {
		return this.easing(this.progress);
	}

	update(deltaTime, events, input) {
		if (this._finished) return;

		// 첫 업데이트 시 from 값 설정
		if (!this._started) {
			this._started = true;
			if (this.from === null) {
				this.from = this._getValue();
			}
		}

		// deltaTime은 밀리초로 가정
		this._elapsed += deltaTime;

		// 값 보간
		const value = this._interpolate(this.from, this.to, this.easedProgress);
		this._setValue(value);

		this.event.emit('update', value, this.progress);

		// 완료 체크
		if (this._elapsed >= this.duration) {
			this._finished = true;
			this._setValue(this.to);
			this.event.emit('finish', this.to);
			this.finish();
		}
	}

	/**
	 * 현재 값 가져오기
	 */
	_getValue() {
		const value = this.target[this.property];
		// 배열은 복사본 반환
		if (Array.isArray(value)) {
			return [...value];
		}
		return value;
	}

	/**
	 * 값 설정하기
	 */
	_setValue(value) {
		this.target[this.property] = value;
	}

	/**
	 * 값 보간
	 */
	_interpolate(from, to, t) {
		// 배열 (벡터)
		if (Array.isArray(from) && Array.isArray(to)) {
			return from.map((v, i) => v + (to[i] - v) * t);
		}
		// 숫자
		return from + (to - from) * t;
	}

	/**
	 * 트윈 리셋
	 */
	reset() {
		this._elapsed = 0;
		this._started = false;
		this._finished = false;
	}
}
