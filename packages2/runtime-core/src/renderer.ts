import { effect } from '@guide-mini-vue/reactivity';
import { EMPTY_OBJ, ShapeFlags } from "@guide-mini-vue/shared";
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from './createApp';
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";



export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode, container) {
    // 调用 patch（便于递归处理）
    patch(null, vnode, container, null, null);
  }

  // n1 ： 老虚拟节点
  // n2： 新虚拟节点
  function patch(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag, type } = n2;

    // Fragment -> 只渲染children

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.appendChild(textNode)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    // mount // update
    if (!n1) { 
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement');
    console.log('n1: ', n1);
    console.log('n2: ', n2);

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    /**
     * 这里的el， 一开始是从mountElement中定义的、
     * 这里如果只是拿去 const el = n1.el 在下一次更新时会取不到el，因为n2会取代n1
     */
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array to text
        /**
         * 1. 把老的清空
         */
        unmountChildren(c1);
      }
      if (c2 !== c1) {
        // 2. 设置新值
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array -> array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    // 左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++
    }

    console.log('left: ', i, e1, e2);

    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    
    console.log('right: ', i, e1, e2);

    // 新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else {
      // 老的比新的多
      if (i > e2) {
        while (i <= e1) {
          hostRemove(c1[i].el);
          i++;
        }
      } else {
        // 乱序
        const s1 = i; // 老节点 i
        const s2 = i; // 新节点 i

        const toBePatched = e2 - s2 + 1;
        let patched = 0;

        
        const keyToNewIndexMap = new Map();

        const newIndexToOldIndexMap = new Array(toBePatched);
        newIndexToOldIndexMap.fill(0);

        let moved = false;
        let maxNewIndexSoFar = 0;

        // 遍历新节点乱序部分 ， 建立key和index的映射， 方便后续遍历老节点乱序部分时查找是否有相同key
        for (let i = s2; i <= e2; i++) {
          const nextChild = c2[i];
          keyToNewIndexMap.set(nextChild.key, i);
        }


        // 遍历老节点 乱序部分 
        // 
        for (let i = s1; i <= e1; i++) {
          const prevChild = c1[i];

          if (patched >= toBePatched) {
            hostRemove(prevChild.el)
            continue;
          }

          let newIndex;
          if(prevChild.key != null) {
            newIndex = keyToNewIndexMap.get(prevChild.key);
          } else {
            // 遍历新节点 乱序部分 找到 与当前老节点 一样的 下标 // 移动！
            for (let j = s2; j <= e2; j++) {
              if(isSomeVNodeType(prevChild, c2[j])){
                newIndex = j

                break;
              }
            }
          }
          // 没有新的位置 // 删掉
          // 如果找到对应的新位置 则patch
          if(newIndex === undefined) {
            hostRemove(prevChild.el);
          } else {
            if(newIndex >= maxNewIndexSoFar) {
              maxNewIndexSoFar = newIndex
            } else {
              moved = true
            }

            newIndexToOldIndexMap[newIndex - s2] = i + 1;

            patch(prevChild, c2[newIndex], container, parentComponent, null);
            patched++
          }
        }

        // 获取 最长递增子序列
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
        let j = increasingNewIndexSequence.length - 1;
        for (let i = toBePatched - 1; i >= 0; i--){
          const nextIndex = i + s2;
          const nextChild = c2[nextIndex];
          const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

          if(newIndexToOldIndexMap[i] === 0) {
            patch(null, nextChild, container, parentComponent, anchor);
          } else if (moved) {
            if (j < 0 || i !== increasingNewIndexSequence[j]) {
              console.log('移动');
              hostInsert(nextChild.el, container, anchor);
            } else {
              j--;
            }
          }
        }
      }
    }

  }

  function isSomeVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      // remove
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent, anchor) {
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
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // props
    for (let key in props) {
      // 先实现具体 -> 通用
      // on + Event name
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    hostInsert(el, container, anchor);
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) { 
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component); // 类似el
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;

      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));

    setupComponent(instance);
    setupRenderEffect(
    instance,
    initialVNode,
    container,
    anchor
  );
  }

  function setupRenderEffect(
    instance: any,
    initialVNode: any,
    container: any,
    anchor
  ) {
    function componentUpdateFn() {
      
      if (!instance.isMounted) {
        // init

        const { proxy } = instance;
        const subTree = (instance.subTree =
          instance.render.call(proxy, proxy)); // 存一下，之后update时作为旧节点信息

        // vnode -> patch
        // vnode -> element -> mountElement

        patch(null, subTree, container, instance, anchor);

        // element -> mount
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        // update
        console.log('update');

        const { next, vnode } = instance;

        if (next) {
          next.el = vnode.el; // 更新el

          updateComponentPreRender(instance, next);
        }

        const { proxy } = instance;
        const subTree = instance.render.call(proxy, proxy);
        const prevSubTree = instance.subTree;

        instance.subTree = subTree; // 更新subTree

        console.log(subTree);
        console.log(prevSubTree);

        patch(prevSubTree, subTree, container, instance, anchor);
      }
    }
    instance.update = effect(componentUpdateFn, {
      scheduler() {
        // console.log('update - scheduler');
        queueJobs(instance.update)
      }
    })
  }

  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
  }


  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((child) => {
      patch(null, child, container, parentComponent, anchor);
    });
  }

  return {
    createApp: createAppAPI(render),
  };

}


function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}