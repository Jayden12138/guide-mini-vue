import { ShapeFlags, isOn } from "../shared/src/index";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from './createApp';
import { Fragment, Text } from "./vnode";



export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options

  function render(vnode, container) {
    // 调用 patch（便于递归处理）
    patch(vnode, container, null);
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

    const el = (vnode.el = hostCreateElement(vnode.type));

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
      hostPatchProp(el, key, val);
    }
    hostInsert(el, container);
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

  return {
    createApp: createAppAPI(render),
  };

}
