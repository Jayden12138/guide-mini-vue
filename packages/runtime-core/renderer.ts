import { effect } from "../reactivity/src/effect";
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
    patch(null, vnode, container, null);
  }

  // n1 ： 老虚拟节点
  // n2： 新虚拟节点
  function patch(n1, n2, container, parentComponent) {
    const { shapeFlag, type } = n2;

    // Fragment -> 只渲染children

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.appendChild(textNode)
  }

  function processElement(n1, n2, container, parentComponent) {
    // mount // update
    if (!n1) { 
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log('patchElement')
    console.log('n1: ', n1)
    console.log('n2: ', n2)

    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    /**
     * 这里的el， 一开始是从mountElement中定义的、
     * 这里如果只是拿去 const el = n1.el 在下一次更新时会取不到el，因为n2会取代n1
     */
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);

  }

  function patchProps(el, oldProps, newProps) {
    for(const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
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
      hostPatchProp(el, key, null, val);
    }
    hostInsert(el, container);
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent);
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
    effect(() => {
      if (!instance.isMounted) {
        // init 

        const { proxy } = instance;
        const subTree = (instance.subTree =
          instance.render.call(proxy)); // 存一下，之后update时作为旧节点信息
        console.log(subTree);

        // vnode -> patch
        // vnode -> element -> mountElement

        patch(null, subTree, container, instance);

        // element -> mount
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        // update
        console.log('update')
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;

        instance.subTree = subTree // 更新subTree

        console.log(subTree);
        console.log(prevSubTree)

        
        patch(prevSubTree, subTree, container, instance);

      }
    })
  }


  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((child) => {
      patch(null, child, container, parentComponent);
    });
  }

  return {
    createApp: createAppAPI(render),
  };

}
