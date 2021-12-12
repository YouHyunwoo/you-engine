export class Event {

	constructor(engine) {
		this.engine = engine;

		this.events = [];
	}

	add(event) {
		this.events.push(event);
	}

	getEvents() {
		return this.events;
	}

	clear() {
		this.events.splice(0);
	}
}