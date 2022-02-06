import { EventEmitter } from "../utilities/event.js";


export class Progress {

    constructor(speed, repeat) {
        this.event = new EventEmitter();
        this.speed = speed ?? 1;
        this.repeat = repeat ?? false;
        this.value = 0;
    }

    update(delta) {
        if (!this.repeat && this.value >= 1) { return }

        this.value += delta * this.speed;

        this.event.emit('update', this.value);

        if (this.value >= 1) {
            if (!this.repeat) {
                this.value = 1;
                this.event.emit('finish');
            }
            else {
                const count = Math.floor(this.value);
                this.value -= count;

                for (let i = 0; i < count; i++) {
                    this.event.emit('exceed');
                }
            }
        }
    }

    static create(speed, repeat, update, finish, exceed) {
        const animation = new this(speed, repeat);

        if (update) {
            animation.event.on('update', update);
        }

        if (finish) {
            animation.event.on('finish', finish);
        }

        if (exceed) {
            animation.event.on('exceed', exceed);
        }

        return animation;
    }
}