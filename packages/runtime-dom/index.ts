
import { createRenderer } from '../runtime-core/index'
import { isOn } from '../shared/src/index';

function createElement(type: string) {
    return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    el.setAttribute(key, nextVal);
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