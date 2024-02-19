'use strict';

var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};
var isOn = function (key) { return /^on[A-Z]/.test(key); };

var extend = Object.assign;
var isObject = function (val) { return val !== null && typeof val === 'object'; };

/**
 * effect(()=>{}) 接收一个函数，依赖发生变化则执行fn，
 * 当执行fn时，如果遇到reactive包装的变量，则会出发get 在get中出发track 收集依赖，这里就是把当前的effect中的fn，保存起来
 * 当reactive包装的变量发生变化时，会触发set 在set中触发trigger trigger中会查询到之前保存的相关effect函数fn，遍历执行
 */
var targetMap = new Map();
// 触发依赖
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
}

var get = createGetter(); // 优化点 不需要每次访问都调用createGetter 这里只会在初始化的时候执行一次
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) { // 在前面优化reactive 和 readonly时，这里的get被抽离出来，通过传入的isReadonly来区分，这里isReactive也可以借用这个值来判断
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res; // 不用处理嵌套对象 也不需要track 直接返回res
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        Reflect.set(target, key, value);
        trigger(target, key);
        return true;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("Set operation on key \"".concat(key, "\" failed: target is readonly."), target);
        return true;
    },
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    if (isObject(raw)) {
        return new Proxy(raw, baseHandlers);
    }
    else {
        console.warn("target ".concat(raw, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61"));
    }
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    /**
     * vue3中在 setup return 的对象中，有 ref 类型，但在 template 中访问该变量不需要使用 .value，因为这里 使用了 proxyRefs
     *
     * 这里需要在 get 的时候，如果访问的是 ref 则返回 ref.value ，否则直接返回
     *
     * set 时，如果原来是 ref && 现在新值不是 ref，则修改 ref.value
     * 其他情况直接赋值
     */
    // 这里因为要在 get set 时进行处理，所以需要使用到 Proxy
    return new Proxy(objectWithRefs, {
        get: function (target, key) {
            return unRef(Reflect.get(target, key));
        },
        set: function (target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    console.log('emit: ', event);
    // instance.props -> event
    var props = instance.props;
    /**
     * TPP
     * 先特定行为 -> 重构为通用行为
     *
     * 特定
     * const handler = props['onAdd']
     * handler && handler()
     *
     * 通用
     * add -> Add
     * const handler = props[`on${capitalize(event)}`];
     *
     * Add -> onAdd
     * const handlerName = toHandlerKey(event)
     * const handler = props[handlerName]
     *
     */
    var handlerName = toHandlerKey(event);
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
}
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var toHandlerKey = function (str) {
    return str ? 'on' + capitalize(str) : '';
};

function initProps(instance, rawProps) {
    // TODO: attrs
    instance.props = rawProps || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; }
};
var componentPublicIstanceHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        // setupState
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        el: null,
        proxy: {},
        emit: function () { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, componentPublicIstanceHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function | object
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    else if (typeof setupResult === 'function') {
        instance.render = setupResult;
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
    patch(vnode, container);
}
function patch(vnode, container) {
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
    var children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
    // children: string | array
    if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // props
    for (var key in props) {
        // 先实现具体 -> 通用
        // on + Event name
        var val = props[key];
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, val);
        }
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    var instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
    // element -> mount
    initialVNode.el = subTree.el;
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
        children: children,
        shapeFlag: getShapeFlag(type)
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 8 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1 /* ShapeFlags.ELEMENT */
        : 4 /* ShapeFlags.STATEFUL_COMPONENT */;
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

exports.add = add;
exports.createApp = createApp;
exports.h = h;
