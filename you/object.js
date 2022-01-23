import { Stateful } from "./framework/object.js";


export class Object extends Stateful {

	constructor(name, enable) {
		super(enable);

		this.name = name;
		this.parent = null;
		this.tags = new Set();
		this.components = [];
		this.objects = [];
	}

	create(...args) {
		if (this._created) { return }
		this.willCreate(...args);
		this.event.emit('willCreate');
		this._created = true;
		this.components.forEach(component => component.create(...args));
		this.objects.forEach(object => object.create(...args));
		this.didCreate(...args);
		this.event.emit('didCreate');
	}

	destroy(...args) {
		if (!this._created || this._destroyed) { return }
		this.willDestroy(...args);
		this.event.emit('willDestroy');
		this._created = false;
		this.components.forEach(component => component.destroy(...args));
		this.objects.forEach(object => object.destroy(...args));
		this.didDestroy(...args);
		this.event.emit('didDestroy');
	}

	update(deltaTime, events, input) {
		if (!this._enabled || !this._created || this._destroyed) { return }
		this.willUpdate(deltaTime, events, input);
		this.components.forEach(component => component.update(deltaTime, events, input));
		this.objects.forEach(object => object.update(deltaTime, events, input));
		this.didUpdate(deltaTime, events, input);
	}

	render(context, screen, screens) {
		if (!this._enabled || !this._created || this._destroyed) { return }
		this.willRender(context, screen, screens);
		this.components.forEach(component => component.render(context, screen, screens));
		this.objects.forEach(object => object.render(context, screen, screens));
		this.didRender(context, screen, screens);
	}

	add(object) {
		this.objects.push(object);
        object.parent = this;
	}

	remove(object) {
		const index = this.objects.indexOf(object);

        if (index >= 0) {
            this.objects.splice(index, 1);
            object.parent = null;
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

	findComponent(type) {
		return this.components.find(component => component instanceof type);
	}

	findAllComponent(type) {
		return this.components.filter(component => component instanceof type);
	}
}