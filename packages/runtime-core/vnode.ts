import { ShapeFlags } from "../shared/src/index"

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type)
    }
    

    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if(Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }

    // 是组件类型 && children object
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if(typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        }
    }

    return vnode
}

function getShapeFlag(type: any) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT
}