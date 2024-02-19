import { ShapeFlags, isOn } from "../shared/src/index";
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";

export function render(vnode, container, parentComponent) {
  // 调用 patch（便于递归处理）
  patch(vnode, container, parentComponent);
}


function patch(vnode, container, parentComponent) {
  const { shapeFlag, type } = vnode;

  // Fragment -> 只渲染children

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.appendChild(textNode)
}

function processElement(vnode, container, parentComponent) {
  // mount // update
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode, container, parentComponent) {
  // 四步
  // const el = document.createElement('div')
  // el.textContent = 'hi'
  // el.setAttribute('key', 'value')
  // document.body.append(el)

  const el = (vnode.el = document.createElement(vnode.type));

  const { children, props, shapeFlag } = vnode;
  // children: string | array
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
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

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVNode, container, parentComponent) {
  const instance = createComponentInstance(
    initialVNode,
    parentComponent
  );

  setupComponent(instance);
  setupRenderEffect(
    instance,
    initialVNode,
    container
  );
}

function setupRenderEffect(
  instance: any,
  initialVNode: any,
  container: any,
) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  // vnode -> element -> mountElement

  patch(subTree, container, instance);

  // element -> mount
  initialVNode.el = subTree.el;
}


function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach((child) => {
    patch(child, container, parentComponent);
  });
}