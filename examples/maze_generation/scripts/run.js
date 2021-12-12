import { startEngine } from "../../../you/engine.js";
import { MazeGeneration } from "./mazeGeneration.js";


const configurations = {
    screens: {
        default: {
            canvas: document.querySelector('canvas'),
            size: [800, 800],
        }
    },
    applications: [
        new MazeGeneration(),
    ]
}

startEngine(configurations);