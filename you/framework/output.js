export class Output {

    constructor(engine) {
        this.engine = engine;
        this.screens = {};
        this._pointerLockListener = null;
    }

    addScreen(id, screen) {
        this.screens[id] = screen;
    }

    lockPointer(id) {
        const screen = this.screens[id];
        if (!screen || !screen.canvas) {
            console.warn(`Screen "${id}" not found or invalid`);
            return;
        }
        const canvas = screen.canvas;

        // 기존 리스너가 없을 때만 등록
        if (!this._pointerLockListener) {
            this._pointerLockListener = () => {
                if (document.pointerLockElement === canvas ||
                    document.mozPointerLockElement === canvas) {
                    this.engine.input.lockPointer();
                }
                else {
                    this.engine.input.unlockPointer();
                }
            };
            document.addEventListener('pointerlockchange', this._pointerLockListener);
        }

        canvas.requestPointerLock();
    }

    unlockPointer() {
        document.exitPointerLock();
    }

    disconnect() {
        if (this._pointerLockListener) {
            document.removeEventListener('pointerlockchange', this._pointerLockListener);
            this._pointerLockListener = null;
        }
    }
}