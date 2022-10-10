import { EventEmitter } from "../utilities/event.js";


export class Base {

	create(...args) {
		this.willCreate(...args);
		this.didCreate(...args);
	}
	willCreate(...args) {}
	didCreate(...args) {}

	destroy(...args) {
		this.willDestroy(...args);
		this.didDestroy(...args);
	}
	willDestroy(...args) {}
	didDestroy(...args) {}

	update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
		this.didUpdate(deltaTime, events, input);
	}
	willUpdate(deltaTime, events, input) {}
	didUpdate(deltaTime, events, input) {}

	render(context, screen, screens) {
		this.willRender(context, screen, screens);
		this.didRender(context, screen, screens);
	}
	willRender(screens) {}
	didRender(screens) {}
}

export class Enable extends Base {

	constructor(enable) {
		super();

		this._enabled = enable ?? true;

		this.event = new EventEmitter();
	}

	get enable() { return this._enabled }
	set enable(value) {
		if (value === true) {
			this.willBeEnabled();
			this.event.emit('willBeEnabled');
			this._enabled = value;
			this.didBeEnabled();
			this.event.emit('didBeEnabled');
		}
		else if (value === false) {
			this.willBeDisabled();
			this.event.emit('willBeDisabled');
			this._enabled = value;
			this.didBeDisabled();
			this.event.emit('didBeDisabled');
		}
	}
	willBeEnabled() {}
	didBeEnabled() {}
	willBeDisabled() {}
	didBeDisabled() {}

	update(deltaTime, events, input) {
		if (!this._enabled) { return }
		this.willUpdate(deltaTime, events, input);
		this.didUpdate(deltaTime, events, input);
	}

	render(context, screen, screens) {
		if (!this._enabled) { return }
		this.willRender(context, screen, screens);
		this.didRender(context, screen, screens);
	}
}

export class Stateful extends Enable {

	constructor(enable) {
		super(enable);

		this._created = false;
		this._destroyed = false;
	}

	get enable() { return this._enabled }
	set enable(value) {
		if (value === true) {
			this.willBeEnabled();
			this.event.emit('willBeEnabled');
			this._enabled = value;
			this.didBeEnabled();
			this.event.emit('didBeEnabled');
		}
		else if (value === false) {
			this.willBeDisabled();
			this.event.emit('willBeDisabled');
			this._enabled = value;
			this.didBeDisabled();
			this.event.emit('didBeDisabled');
		}
	}

	get created() { return this._created }
	create(...args) {
		if (this._created) { return }
		this.willCreate(...args);
		this.event.emit('willCreate');
		this._created = true;
		this.didCreate(...args);
		this.event.emit('didCreate');
	}
	willCreate(...args) {}
	didCreate(...args) {}

	get destroyed() { return this._destroyed }
	destroy(...args) {
		if (!this._created || this._destroyed) { return }
		this.willDestroy(...args);
		this.event.emit('willDestroy');
		this._destroyed = true;
		this.didDestroy(...args);
		this.event.emit('didDestroy');
	}
	willDestroy(...args) {}
	didDestroy(...args) {}

	update(deltaTime, events, input) {
		if (!this._enabled || !this._created || this._destroyed) { return }
		this.willUpdate(deltaTime, events, input);
		this.didUpdate(deltaTime, events, input);
	}
	willUpdate(deltaTime, events, input) {}
	didUpdate(deltaTime, events, input) {}

	render(context, screen, screens) {
		if (!this._enabled || !this._created || this._destroyed) { return }
		this.willRender(context, screen, screens);
		this.didRender(context, screen, screens);
	}
	willRender(screens) {}
	didRender(screens) {}
}