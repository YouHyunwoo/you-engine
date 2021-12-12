export class Output {

    constructor(engine) {
        this.screens = {};
    }

    addScreen(id, screen) {
        this.screens[id] = screen;
    }
}