import { ShapeFlags, isOn } from "../shared/src/index";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 调用 patch（便于递归处理）
    patch(vnode, container)
}


function patch(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    }else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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

    const { children, props, shapeFlag } = vnode
    // children: string | array
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
    }

  // props
  for (let key in props) {
    // 先实现具体 -> 通用
      // on + Event name
    const val = props[key];
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
  }

  container.appendChild(el);
}

function processComponent(vnode, container) {
    mountComponent(vnode, container);
}

function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(
  instance: any,
  initialVNode: any,
  container: any
) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  // vnode -> element -> mountElement

  patch(subTree, container);

  // element -> mount
  initialVNode.el = subTree.el;
}


function mountChildren(vnode, container) {
    vnode.children.forEach((child) => {
        patch(child, container);
    });
}