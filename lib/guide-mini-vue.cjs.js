'use strict';

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance, container) {
    // initProps
    // initSlots
    // setupStatefulComponent
    // initProps
    // initSlots
    // setupStatefulComponet
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // setupResult: function | object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult == 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode);
}
function patch(vnode, container) {
    // vnode type: component | element
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // mount | update
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // instance
    // setup
    // setupRenderEffect
    // instance
    const instance = createComponentInstance(vnode);
    // setup 去配置 render 以及其他 props 、slots 等
    setupComponent(instance);
    // setupRenderEffect 调用 render
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 执行 render
    const subTree = instance.render();
    patch(subTree);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function add(a, b) {
    return a + b;
}

exports.add = add;
exports.createApp = createApp;
exports.h = h;
