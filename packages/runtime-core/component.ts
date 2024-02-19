import { proxyRefs, shallowReadonly } from "../reactivity/src/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps"
import { componentPublicIstanceHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
    // console.log('createComponentInstance', parent)
    const component = {
      vnode,
      type: vnode.type,
      setupState: {},
      el: null,
        proxy: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
      emit: () => {},
    };

    component.emit = emit.bind(null, component);
    return component
}

export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)

    initSlots(instance, instance.vnode.children)

    setupStatefulComponent(instance)
} 

function setupStatefulComponent(instance) {
    const Component = instance.type

    instance.proxy = new Proxy({_: instance}, componentPublicIstanceHandlers)

    const { setup } = Component

    if (setup) {
        setCurrentInstance(instance)
        
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {
    // function | object
    if(typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }else if(typeof setupResult === 'function') {
        instance.render = setupResult
    }
    finishComponentSetup(instance)

}

function finishComponentSetup(instance) {
    const Component = instance.type
    if(Component.render) {
        instance.render = Component.render
    }
}


let currentInstance = null
export function getCurrentInstance() {
    return currentInstance
}

export function setCurrentInstance(instance) {
    // 方便debugger，维护
    // 作为一个中间层
    currentInstance = instance
}