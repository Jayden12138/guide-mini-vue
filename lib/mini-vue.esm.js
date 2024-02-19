var isObject = function (val) { return val !== null && typeof val === 'object'; };

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {}
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
    instance.proxy = new Proxy({}, {
        get: function (target, key) {
            var setupState = instance.setupState;
            // setupState
            if (key in setupState) {
                return setupState[key];
            }
            // 
        }
    });
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function | object
    instance.setupState = setupResult;
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
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // mount // update
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 四步
    // const el = document.createElement('div')
    // el.textContent = 'hi'
    // el.setAttribute('key', 'value')
    // document.body.append(el)
    var el = document.createElement(vnode.type);
    vnode.el = el;
    var children = vnode.children, props = vnode.props;
    // children: string | array
    if (typeof children == 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    // props
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (child) {
        patch(child, container);
    });
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
            render(vnode, rootContainer);
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
