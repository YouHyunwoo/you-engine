import { EventEmitter } from "../utilities/event.js";


export class Object {

	constructor({
		events={},
	}={}) {
		this.event = new EventEmitter(this);
		window.Object.keys(events).forEach(event => this.event.on(event, events[event]));
	}

	create(...args) {
		this.willCreate(...args);
		this.event.emit('willCreate');
		this.didCreate(...args);
		this.event.emit('didCreate');
	}
	willCreate(...args) {}
	didCreate(...args) {}

	destroy(...args) {
		this.willDestroy(...args);
		this.event.emit('willDestroy');
		this.didDestroy(...args);
		this.event.emit('didDestroy');
	}
	willDestroy(...args) {}
	didDestroy(...args) {}
}

export class Loopable extends Object {

	constructor({
		events={},
	}={}) {
		super({
			events,
		});
	}

	update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
		this.event.emit('willUpdate');
		this.didUpdate(deltaTime, events, input);
		this.event.emit('didUpdate');
	}
	willUpdate(deltaTime, events, input) {}
	didUpdate(deltaTime, events, input) {}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);
		this.event.emit('willRender');
		this.didRender(context, screen, screens);
		this.event.emit('didRender');
	}
	willRender(screens) {}
	didRender(screens) {}
}

export class Enable extends Loopable {

	static ENABLE = Symbol('enable');

	constructor({
		enable=true,
		events={},
	}={}) {
		super({
			events,
		});

		this[this.constructor.ENABLE] = enable;
	}

	get enable() { return this[this.constructor.ENABLE] }
	set enable(value) {
		if (value === true) {
			this.willBeEnabled();
			this.event.emit('willBeEnabled');
			this[this.constructor.ENABLE] = value;
			this.didBeEnabled();
			this.event.emit('didBeEnabled');
		}
		else if (value === false) {
			this.willBeDisabled();
			this.event.emit('willBeDisabled');
			this[this.constructor.ENABLE] = value;
			this.didBeDisabled();
			this.event.emit('didBeDisabled');
		}
	}
	willBeEnabled() {}
	didBeEnabled() {}
	willBeDisabled() {}
	didBeDisabled() {}

	update(deltaTime, events, input) {
		if (this[this.constructor.ENABLE]) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate');
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate');
		}
	}

	render(context, screen, screens) {
		if (this[this.constructor.ENABLE]) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender');
			this.didRender(context, screen, screens);
			this.event.emit('didRender');
		}
	}
}

export class Stateful extends Enable {

	static STATE = Symbol('state');
	static STATES = {
		INSTANTIATED: Symbol('state.instantiated'),
		CREATED: Symbol('state.created'),
		DESTROYED: Symbol('state.destroyed'),
	};

	constructor({
		enable=true,
		events={},
	}={}) {
		super({
			enable,
			events,
		});

		this[this.constructor.STATE] = this.constructor.STATES.INSTANTIATED;
	}

	get created() { return this[this.constructor.STATE] === this.constructor.STATES.CREATED }
	create(...args) {
		if (this[this.constructor.STATE] === this.constructor.STATES.INSTANTIATED) {
			this.willCreate(...args);
			this.event.emit('willCreate');
			this[this.constructor.STATE] = this.constructor.STATES.CREATED;
			this.didCreate(...args);
			this.event.emit('didCreate');
		}
	}

	get destroyed() { return this[this.constructor.STATE] === this.constructor.STATES.DESTROYED }
	destroy(...args) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED) {
			this.enable = false;

			this.willDestroy(...args);
			this.event.emit('willDestroy');
			this[this.constructor.STATE] = this.constructor.STATES.DESTROYED;
			this.didDestroy(...args);
			this.event.emit('didDestroy');
		}
	}

	get enable() { return this[this.constructor.ENABLE] }
	set enable(value) {
		if (this[this.constructor.STATE] === this.constructor.STATES.DESTROYED) { return }

		if (value === true) {
			this.willBeEnabled();
			this.event.emit('willBeEnabled');
			this[this.constructor.ENABLE] = value;
			this.didBeEnabled();
			this.event.emit('didBeEnabled');
		}
		else if (value === false) {
			this.willBeDisabled();
			this.event.emit('willBeDisabled');
			this[this.constructor.ENABLE] = value;
			this.didBeDisabled();
			this.event.emit('didBeDisabled');
		}
	}

	update(deltaTime, events, input) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate');
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate');
		}
	}

	render(context, screen, screens) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender');
			this.didRender(context, screen, screens);
			this.event.emit('didRender');
		}
	}
}