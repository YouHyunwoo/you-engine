export class Loop {

	constructor(engine) {
		this.engine = engine;

		this.lastTime = 0;
		this.callback = this.loop.bind(this);
		this.handle = null;
	}

	start() {
		this.lastTime = 0;

		window.requestAnimationFrame(t => {
			this.lastTime = t;
			this.handle = window.requestAnimationFrame(this.callback);
		});
	}

	stop() {
		this.handle = null;
	}

	loop(elapsedTime) {
		const deltaTime = elapsedTime - this.lastTime;
		this.lastTime = elapsedTime;

		this.engine.applications.forEach(app => {
			app.update(deltaTime, this.engine.event.events, this.input);
			app.render(this.engine.output.screens);
		});

		this.engine.event.clear();

		if (this.handle) {
			this.handle = window.requestAnimationFrame(this.callback);
		}
	}
}