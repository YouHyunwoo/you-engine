import { Stateful } from "./framework/object.js";


export class Object extends Stateful {

	name = null;
	tags = new Set();
	components = [];
	objects = [];
	parent = null;

	constructor({
		name='', enable=true,
		tags=[],
		components=[],
		objects=[],
		events={},
	}={}) {
		super({
			enable,
			events,
		});

		this.name = name;
		tags.forEach(tag => this.tags.add(tag));
		components.forEach(component => this.addComponent(component));
		objects.forEach(object => this.add(object));
	}

	get root() { return this.parent?.root ?? this.parent }

	create(...args) {
		if (this[this.constructor.STATE] === this.constructor.STATES.INSTANTIATED) {
			this.willCreate(...args);
			this.event.emit('willCreate', ...args);
			this[this.constructor.STATE] = this.constructor.STATES.CREATED;
			this.components.forEach(component => component.create(...args));
			this.objects.forEach(object => object.create(...args));
			this.didCreate(...args);
			this.event.emit('didCreate', ...args);
		}
	}

	destroy(...args) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED) {
			this[this.constructor.STATE] = this.constructor.STATES.DESTROYING;

			this.enable = false;

			this.willDestroy(...args);
			this.event.emit('willDestroy', ...args);
			this[this.constructor.STATE] = this.constructor.STATES.DESTROYED;
			this.components.forEach(component => component.destroy(...args));
			this.objects.forEach(object => object.destroy(...args));
			this.didDestroy(...args);
			this.event.emit('didDestroy', ...args);

			if (this.parent) {
				this.parent.remove(this);
				this.parent = null;
			}
		}
	}

	update(deltaTime, events, input) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willUpdate(deltaTime, events, input);
			this.event.emit('willUpdate', deltaTime, events, input);
			this.components.forEach(component => component.update(deltaTime, events, input));
			this.objects.forEach(object => object.update(deltaTime, events, input));
			this.didUpdate(deltaTime, events, input);
			this.event.emit('didUpdate', deltaTime, events, input);
		}
	}

	render(context, screen, screens) {
		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED && this[this.constructor.ENABLE]) {
			this.willRender(context, screen, screens);
			this.event.emit('willRender', context, screen, screens);
			this.components.forEach(component => component.render(context, screen, screens));
			this.objects.forEach(object => object.render(context, screen, screens));
			this.didRender(context, screen, screens);
			this.event.emit('didRender', context, screen, screens);
		}
	}

	add(object) {
		if (object === undefined || object === null) { throw 'object is null' }

		this.objects.push(object);
        object.parent = this;

		if (this[this.constructor.STATE] === this.constructor.STATES.CREATED) {
			object.create();
		}
	}

	remove(object) {
		const index = this.objects.indexOf(object);

        if (index >= 0) {
            this.objects.splice(index, 1);
			if (this[this.constructor.STATE] !== this.constructor.STATES.INSTANTIATED) {
				object.destroy();
			}
			object.parent = null;
			return object;
        }
		else {
			return null;
		}
	}

	find(name) {
		return this.objects.find(object => object.name === name) ?? null;
	}

	findAll(name) {
		return this.objects.filter(object => object.name === name);
	}

	addComponent(component) {
        this.components.push(component);
        component.object = this;
    }

    removeComponent(component) {
        const index = this.components.indexOf(component);

        if (index >= 0) {
            this.components.splice(index, 1);
            component.object = null;
        }
    }

	findComponent(type, requirement=false) {
		const component = this.components.find(component => component instanceof type);

		if (requirement && !component) { throw `The component is required: ${type}` }

		return component;
	}

	findAllComponent(type, requirement=false) {
		const components = this.components.filter(component => component instanceof type);

		if (requirement && components.length === 0) { throw `The component is required: ${type}` }

		return components;
	}
}