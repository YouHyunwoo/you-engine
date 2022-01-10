export default {
    json: {
        async load(url) {
            const data = await fetch(url);
            const json = await data.json();

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