export class Input {

	constructor(engine) {
		this.engine = engine;

		this.onKeyDownCallback = this.onKeyDown.bind(this);
		this.onKeyUpCallback = this.onKeyUp.bind(this);
		this.onPointerDownCallback = this.onPointerDown.bind(this);
		this.onPointerMoveCallback = this.onPointerMove.bind(this);
		this.onPointerUpCallback = this.onPointerUp.bind(this);
		this.onWheelCallback = this.onWheel.bind(this);

		this.keys = new Set();
		this.mouse = [0, 0];
	}

	connect() {
		window.addEventListener('keydown', this.onKeyDownCallback);
		window.addEventListener('keyup', this.onKeyUpCallback);

		Object.values(this.engine.output.screens).forEach(screen => {
			screen.addEventListener('pointerdown', this.onPointerDownCallback);
			screen.addEventListener('pointermove', this.onPointerMoveCallback);
			screen.addEventListener('pointerup', this.onPointerUpCallback);
			screen.addEventListener('wheel', this.onWheelCallback);
		});
	}

	disconnect() {
		window.removeEventListener('keydown', this.onKeyDownCallback);
		window.removeEventListener('keyup', this.onKeyUpCallback);

		Object.values(this.engine.output.screens).forEach(screen => {
			screen.removeEventListener('pointerdown', this.onPointerDownCallback);
			screen.removeEventListener('pointermove', this.onPointerMoveCallback);
			screen.removeEventListener('pointerup', this.onPointerUpCallback);
			screen.removeEventListener('wheel', this.onWheelCallback);
		});
	}

	clear() {
		this.keys.clear();
	}

	onKeyDown(event) {
		this.keys.add(event.key);
		this.engine.event.add({ type: 'keydown', key: event.key });
	}

	onKeyUp(event) {
		if (this.keys.has(event.key)) {
			this.engine.event.add({ type: 'keyup', key: event.key });
		}

		this.keys.delete(event.key);
	}

	onPointerDown(event) {
		this.engine.event.add({ type: 'mousedown', position: [event.offsetX, event.offsetY] });
	}

	onPointerMove(event) {
		this.mouse = [event.offsetX, event.offsetY];
		this.engine.event.add({ type: 'mousemove', position: [event.offsetX, event.offsetY] });
	}

	onPointerUp(event) {
		this.engine.event.add({ type: 'mouseup', position: [event.offsetX, event.offsetY] });
	}

	onWheel(event) {
		this.engine.event.add({ type: 'mousewheel', position: [event.offsetX, event.offsetY], delta: event.deltaY });
	}
}