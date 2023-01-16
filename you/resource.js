import resource from "./utilities/resource.js";

export class Resource {

    constructor({
        prefix
    }={}) {
        this.prefix = prefix;
    }

    async load(...resourceIds) {
        for (const resourceId of resourceIds) {
            const data = await resource.json.load(`${this.prefix}${resourceId}.json`);
            this[resourceId] = await resource.json.parse(data);
        }
    }

    release(...resourceIds) {
        if (resourceIds.length <= 0) {
            this.clear();
        }
        else {
            for (const resourceId of resourceIds) {
                delete this[resourceId];
            }
        }
    }

    clear() {
        for (const resourceId in this) {
            delete this[resourceId];
        }
    }
}