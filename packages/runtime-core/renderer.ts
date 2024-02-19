import { isObject } from "../reactivity/src/shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 调用 patch（便于递归处理）
    patch(vnode, container)
}


function patch(vnode, container) {
    if (typeof vnode.type === "string") {
        processElement(vnode, container)
    }else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
}

function processElement(vnode, container) {
    // mount // update
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
  // 四步
  // const el = document.createElement('div')
  // el.textContent = 'hi'
  // el.setAttribute('key', 'value')
  // document.body.append(el)

  const el = document.createElement(vnode.type);
  vnode.el = el;

    const { children, props } = vnode
    // children: string | array
    if(typeof children == 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode, el)
    }

  // props
  for (let key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.appendChild(el);
}

function processComponent(vnode, container) {
    mountComponent(vnode, container);
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


function mountChildren(vnode, container) {
    vnode.children.forEach((child) => {
        patch(child, container);
    });
}