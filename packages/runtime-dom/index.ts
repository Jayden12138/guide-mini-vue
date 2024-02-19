
import { createRenderer } from '../runtime-core/index'
import { isOn } from '../shared/src/index';

function createElement(type: string) {
    return document.createElement(type)
}

function patchProp(el, key, val) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
}
function insert(el, container) {
    container.appendChild(el);
}

const renderer = createRenderer({
    createElement,
    patchProp,
    insert
})

export function createApp(...args) {
    return renderer.createApp(...args)
}


export * from '../runtime-core/index';