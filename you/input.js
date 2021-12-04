export class Input {

	constructor(engine) {
		this.engine = engine;

		this.keys = new Set();

		window.addEventListener('keydown', e => {
			this.keys.add(e.key);
			this.engine.events.push({ type: 'keydown', key: e.key });
		});
		window.addEventListener('keyup', e => {
			this.keys.delete(e.key);
			this.engine.events.push({ type: 'keyup', key: e.key });
		});
	}

	clear() {
		this.keys.clear();
	}
}