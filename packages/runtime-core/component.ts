import { proxyRefs, shallowReadonly } from "../reactivity/src/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps"
import { componentPublicIstanceHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode) {
    const component = {
      vnode,
      type: vnode.type,
      setupState: {},
      el: null,
        proxy: {},
        slots: {},
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        
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