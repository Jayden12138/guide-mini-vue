import { proxyRefs, shallowReadonly } from "../reactivity/src/reactive";
import { initProps } from "./componentProps"
import { componentPublicIstanceHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
    const component = {
      vnode,
      type: vnode.type,
      setupState: {},
      el: null,
      proxy: {},
    };
    return component
}

export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)

    // initSlots()

    setupStatefulComponent(instance)
} 

function setupStatefulComponent(instance) {
    const Component = instance.type

    instance.proxy = new Proxy({_: instance}, componentPublicIstanceHandlers)

    const { setup } = Component

    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props));
        
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