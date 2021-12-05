export class BaseObject {

	constructor() {
		this.objects = [];
	}

	create(...args) { // Call by Resource
		this.willCreate(...args);
		this.objects.forEach(object => object.create(...args));
		this.didCreate(...args);
	}
	willCreate(...args) {}
	didCreate(...args) {}

	destroy(...args) {
		this.willDestroy(...args);
		this.objects.forEach(object => object.destroy(...args));
		this.didDestroy(...args);
	}
	willDestroy(...args) {}
	didDestroy(...args) {}

	update(deltaTime, events, input) {
		this.willUpdate(deltaTime, events, input);
		this.objects.forEach(object => object.update(deltaTime, events, input));
		this.didUpdate(deltaTime, events, input);
	}
	willUpdate(deltaTime, events, input) {}
	didUpdate(deltaTime, events, input) {}

	render(context, screens) {
		this.willRender(context, screens);
		this.objects.forEach(object => object.render(context, screens));
		this.didRender(context, screens);
	}
	willRender(screens) {}
	didRender(screens) {}
}