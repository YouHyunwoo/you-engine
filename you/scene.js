import { BaseObject } from "./object.js";


export class Scene extends BaseObject {

    constructor() {
        super();

        this.application = null;
    }

    push(scene, enterArgs) {
        this.application.push(scene, enterArgs);
    }

    pop(exitArgs) {
        this.application.pop(exitArgs);
    }

    transit(scene, exitArgs, enterArgs) {
        this.application.transit(scene, exitArgs, enterArgs);
    }
}