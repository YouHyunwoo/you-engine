export class Output {

    constructor() {
        this.screens = {};
    }

    addScreen(id, screen) {
        this.screens[id] = screen;
    }
}