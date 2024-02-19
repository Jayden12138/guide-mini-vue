export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }
    return component
}

export function setupComponent(instance) {
    // initProps()

    // initSlots()

    setupStatefulComponent(instance)
} 

function setupStatefulComponent(instance) {
    const Component = instance.type

    instance.proxy = new Proxy({}, {
        get(target, key) {
            const { setupState } = instance
            // setupState
            if(key in setupState) {
                return setupState[key];
            }
            // 

        }
    })

    const { setup } = Component

    if (setup) {
        const setupResult = setup()
        
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {
    // function | object
    instance.setupState = setupResult;

    finishComponentSetup(instance)

}

function finishComponentSetup(instance) {
    const Component = instance.type
    if(Component.render) {
        instance.render = Component.render
    }
}