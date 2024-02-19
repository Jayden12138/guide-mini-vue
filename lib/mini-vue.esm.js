function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function | object
    if (typeof setupResult === 'function') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // 调用 patch（便于递归处理）
    patch(vnode);
}
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode);
    // processElement(vnode, container)
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree);
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先转换为 vnode 虚拟节点
            // 之后所有的逻辑操作都基于 vnode 进行处理
            var vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    var vnode = createVNode(type, props, children);
    return vnode;
}

function add(a, b) {
    return a + b;
}

export { add, createApp, h };
