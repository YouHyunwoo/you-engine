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
		this.event.emit('willCreate', ...args);
		this.didCreate(...args);
		this.event.emit('didCreate', ...args);
	}
	willCreate(...args) {}
	didCreate(...args) {}

	destroy(...args) {
		this.willDestroy(...args);
		this.event.emit('willDestroy', ...args);
		this.didDestroy(...args);
		this.event.emit('didDestroy', ...args);
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
		this.event.emit('willUpdate', deltaTime, events, input);
		this.didUpdate(deltaTime, events, input);
		this.event.emit('didUpdate', deltaTime, events, input);
	}
	willUpdate(deltaTime, events, input) {}
	didUpdate(deltaTime, events, input) {}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);
		this.event.emit('willRender', context, screen, screens);
		this.didRender(context, screen, screens);
		this.event.emit('didRender', context, screen, screens);
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
			this.event.emit('willBeEnabled', value);
			this[this.constructor.ENABLE] = value;
			this.didBeEnabled();
			this.event.emit('didBeEnabled', value);
		}
		else if (value === false) {
			this.willBeDisabled();
			this.event.emit('willBeDisabled', value);
			this[this.constructor.ENABLE] = value;
			this.didBeDisabled();
			this.event.emit('didBeDisabled', value);
		}
	}
	willBeEnabled() {}
	didBeEnabled() {}
	willBeDisabled() {}
	didBeDisabled() {}

	update(deltaTime, events, input) {
		if (this[this.constructor.ENABLE]) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate', deltaTime, events, input);
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate', deltaTime, events, input);
		}
	}

	render(context, screen, screens) {
		if (this[this.constructor.ENABLE]) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender', context, screen, screens);
			this.didRender(context, screen, screens);
			this.event.emit('didRender', context, screen, screens);
		}
	}
}

export class Stateful extends Enable {

	static STATE = Symbol('state');
	static STATES = {
		INSTANTIATED: Symbol('state.instantiated'),
		CREATED: Symbol('state.created'),
		DESTROYING: Symbol('state.destroying'),
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
			this.event.emit('willCreate', ...args);
			this[this.constructor.STATE] = this.constructor.STATES.CREATED;
			this.didCreate(...args);
			this.event.emit('didCreate', ...args);
		}
	}

	get destroyed() { return this[this.constructor.STATE] === this.constructor.STATES.DESTROYED }
	destroy(...args) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED) {
			this[this.constructor.STATE] = this.constructor.STATES.DESTROYING;

			this.enable = false;

			this.willDestroy(...args);
			this.event.emit('willDestroy', ...args);
			this[this.constructor.STATE] = this.constructor.STATES.DESTROYED;
			this.didDestroy(...args);
			this.event.emit('didDestroy', ...args);
		}
	}

	get enable() { return this[this.constructor.ENABLE] }
	set enable(value) {
		if (this[this.constructor.STATE] === this.constructor.STATES.DESTROYING) { return }
		if (this[this.constructor.STATE] === this.constructor.STATES.DESTROYED) { return }

		if (value === true) {
			this.willBeEnabled();
			this.event.emit('willBeEnabled', value);
			this[this.constructor.ENABLE] = value;
			this.didBeEnabled();
			this.event.emit('didBeEnabled', value);
		}
		else if (value === false) {
			this.willBeDisabled();
			this.event.emit('willBeDisabled', value);
			this[this.constructor.ENABLE] = value;
			this.didBeDisabled();
			this.event.emit('didBeDisabled', value);
		}
	}

	update(deltaTime, events, input) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate', deltaTime, events, input);
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate', deltaTime, events, input);
		}
	}

	render(context, screen, screens) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender', context, screen, screens);
			this.didRender(context, screen, screens);
			this.event.emit('didRender', context, screen, screens);
		}
	}
}