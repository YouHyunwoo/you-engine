export default {
    json: {
        async load(url) {
            let accessors = [];

            if (url.includes(':')) {
                const items = url.split(':');
                url = items[0];
                accessors = items.slice(1).join(':').split('.');
            }

            const data = await fetch(url);
            let json = await data.json();

            for (const accessor of accessors) {
                json = json[accessor];
            }

            return json;
        }
    },
    module: {
        async load(url) {
            const module = await import(url);

            return module;
        }
    },
    class: {
        async load(url, name) {
            const module = await import(url);
            const type = module[name];

            return type;
        }
    },
}