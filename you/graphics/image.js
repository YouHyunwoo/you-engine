export class Image {

    constructor(url) {
        this.url = url;

        this.loaded = false;
        this.raw = new window.Image();
        this.raw.onload = () => this.loaded = true;
        this.raw.src = url;
    }

    render(context, ...args) {
        if (this.loaded === false) { return }

        context.drawImage(this.raw, ...args);
    }
}