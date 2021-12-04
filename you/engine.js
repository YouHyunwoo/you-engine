import { Input } from "./input.js";


export class Engine {

	constructor(canvasSize) {
		this.lastTime = 0;

		this.loopCallback = this.loop.bind(this);

		this.canvas = document.querySelector('canvas');
		this.canvas.width = canvasSize[0];
		this.canvas.height = canvasSize[1];

		this.context = this.canvas.getContext('2d');

		this.input = new Input(this);
		this.events = [];

		this.objects = [];
	}

	start() {
		this.lastTime = 0;

		window.requestAnimationFrame(t => {
			this.lastTime = t;

			window.requestAnimationFrame(this.loopCallback);
		});
	}

	loop(elapsedTime) {
		const deltaTime = elapsedTime - this.lastTime;
		this.lastTime = elapsedTime;

		this.update(deltaTime);
		this.render(this.context);

		this.events = [];

		window.requestAnimationFrame(this.loopCallback);
	}

	update(deltaTime) {
		this.objects.forEach(object => object.update(deltaTime, this.events, this.input));
	}

	render(context) {
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.objects.forEach(object => object.render(context));
	}
}