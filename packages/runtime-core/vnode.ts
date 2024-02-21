import { ShapeFlags } from "../shared/src/index"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')


export function createVNode(type, props?, children?) {
    const vnode = {
      type,
      props,
      children,
      key: props && props.key,
      shapeFlag: getShapeFlag(type),
    };
    

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

export function createTextVNode(text: string) {
    return createVNode(Text, {}, text)
}