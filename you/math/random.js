import {} from "./vector.js";


export class Random {

    static range(start, end) { return Math.random() * (end - start) + start }
    static repeat(count) {
        return Array.repeat(count, () => Math.random());
    }
    static color(alpha=false) {
        return `rgba(${Random.repeat(3).mul(255).map(Math.trunc).join(', ')}, ${alpha ? Math.random() : 1})`;
    }
}