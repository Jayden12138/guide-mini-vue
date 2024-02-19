import { createVNode } from "../vnode";

export function renderSlots(slots, name: string, props) {
    const slot = slots[name]
    if (slot) {
        if(typeof slot === 'function') {
            return createVNode('Fragment', {}, slot(props))
        }
    }
}