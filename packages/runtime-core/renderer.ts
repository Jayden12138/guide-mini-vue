import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 调用 patch（便于递归处理）
    patch(vnode, container)
}


function patch(vnode, container) {
    // 处理组件
    processComponent(vnode, container)
}

function processComponent(vnode, container) {
    if (typeof vnode.type === 'function') {
        mountComponent(vnode, container)
    }
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container: any) {
    const subTree = instance.render()

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container)

}
