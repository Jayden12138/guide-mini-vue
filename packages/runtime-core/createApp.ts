import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent: any) {
    return {
        mount(rootContainer: any) {
            // 先转换为 vnode 虚拟节点
            // 之后所有的逻辑操作都基于 vnode 进行处理

            const vnode = createVNode(rootComponent);

            render(vnode, rootContainer)
            
        }
    }
}
