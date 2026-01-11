export class Event {

	constructor(engine) {
		this.engine = engine;

		this.events = [];
	}

	add(event) {
		this.events.push(event);
	}

	clear() {
		this.events.splice(0);
	}
}