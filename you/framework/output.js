export class Output {

    constructor(engine) {
        this.engine = engine;
        this.screens = {};
    }

    addScreen(id, screen) {
        this.screens[id] = screen;
    }

    lockPointer(id) {
        const screen = this.screens[id];
        const canvas = screen.canvas;

        document.addEventListener('pointerlockchange', () => {
			if (document.pointerLockElement === canvas ||
				document.mozPointerLockElement === canvas) {
				this.engine.input.lockPointer();
			}
			else {
				this.engine.input.unlockPointer();
			}
		});

        canvas.requestPointerLock();
    }

    unlockPointer() {
        screen.exitPointerLock();
    }
}