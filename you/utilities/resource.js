import { Animation } from "../graphics/animation.js";
import { Image } from "../graphics/image.js";
import { Sprite } from "../graphics/sprite.js";


async function loadJSON(url) {
    let accessors = [];

    if (url.includes(':')) {
        const items = url.split(':');
        url = items[0];
        accessors = items.slice(1).join(':').split('.');
    }

    const response = await fetch(url);
    if (!response.ok) { return null }

    let data = await response.json();

    for (const accessor of accessors) {
        data = data[accessor];
    }

    return data;
}

async function loadModule(url) {
    const module = await import(url);

    return module;
}

async function loadClass(url, name) {
    const module = await import(url);
    const type = module[name];

    return type;
}

async function parse(obj) {
    if (typeof obj === 'string') {
        return await parseString(obj);
    }
    else if (obj instanceof Object) {
        return await parseObject(obj);
    }
    else if (obj instanceof Array) {
        return await parseArray(obj);
    }
    else {
        return obj;
    }
}

// Reference Rule:
// 1. object reference
//   usage: `@${url}[:${accessor1}.${accessor2}...]`
//   example: '@resources/data/test.json'
// 2. image reference
//   usage: `image@${url}`
//   example: 'image@resources/images/test.png'
// 3. sprite reference
//   usage: `sprite@${url}[:${accessor1}.${accessor2}...]`
//   example: 'sprite@resources/sprites/test.json'
// 4. custom class reference
//   usage: `${custom-class-url}:${custom-class-name}@${url}[:${accessor1}.${accessor2}...]`
//   example: '/scripts/custom.js:CustomClass@resources/scripts/test.json'

// Instantiation Rule:
// 1. using constructor
//   usage: { "@class": "${custom-class-url}:${custom-class-name}", ...kwargs }
// 2. using other initiator
//   usage: { "@class": "${custom-class-url}:${custom-class-name}", "@initiator": "${initiator-name}", ...kwargs }

async function parseString(string) {
    const isReferenceString = string.includes('@');
    if (!isReferenceString) { return string }

    const [prefix, ...urlSlice] = string.split('@');
    const url = urlSlice.join('@');

    if (prefix === '' || prefix === 'object' || prefix === 'obj') {
        const object = await loadJSON(url);
        const data = await parse(object);
        return data;
    }
    else if (prefix === 'image' || prefix === 'img') {
        const image = new Image(url);
        return image;
    }
    else if (prefix === 'sprite' || prefix === 'spr') {
        const object = await loadJSON(url);
        const data = await parse(object);
        const sprite = new Sprite(data);
        return sprite;
    }
    else if (prefix === 'sprite-animation' || prefix === 'spr-ani') {
        const object = await loadJSON(url);
        const data = await parse(object);
        const animation = new Animation(data);
        return animation;
    }
    else {
        const type = await parseCustomClassString(prefix);
        const object = await loadJSON(url);
        const instance = await new type(object);
        return instance;
    }
}

async function parseCustomClassString(string) {
    const isCustomClassString = string.includes(':');
    if (!isCustomClassString) { throw `invalid syntax: ${string}` }

    const [url, ...nameSlice] = string.split(':');
    const name = nameSlice.join(':');
    return await loadClass(url, name);
}

async function parseObject(object) {
    for (const key in object) {
        object[key] = await parse(object[key]);
    }

    const isInstantiationObject = '@class' in object;
    if (isInstantiationObject === false) { return object }

    const type = await parseCustomClassString(object['@class']);

    const hasInitiator = '@initiator' in object;
    if (hasInitiator) {
        const initiator = object['@initiator'];
        return type[initiator](object);
    }
    else {
        return new type(object);
    }
}

async function parseArray(array) {
    return Promise.all(array.map(e => parse(e)));
}

export default {
    json: { load: loadJSON, parse },
    module: { load: loadModule },
    class: { load: loadClass },
}