// 组件的类型
export const enum ShapeFlags {
  // 最后要渲染的 element 类型
  ELEMENT = 1, // 0001
  // 组件类型
  STATEFUL_COMPONENT = 1 << 2, // 0100  // << 左移
  // vnode 的 children 为 string 类型
  TEXT_CHILDREN = 1 << 3, // 1000
  // vnode 的 children 为数组类型
  ARRAY_CHILDREN = 1 << 4, // 10000
  // vnode 的 children 为 slots 类型
  SLOTS_CHILDREN = 1 << 5, // 100000
}


/**
 * vnode -> stateful_component 0/1表示是否是当前这个类型
 * // 修改
 * ShapeFlags.stateful_component = 1
 * 
 * 
 * // 查找
 * if(ShapeFlags.stateful_component)
 * 
 * 
 * 0000
 * 0001 -> element
 * 0010 -> stateful
 * 0100 -> text
 * 1000 -> array
 * 10000 -> slots
 * 
 * 0000 | 0001 -> 0001 -> 1
 * 0000 & 0001 -> 0000
 * 
 * // 修改
 * 0000 -> 0001
 * 0000 | 0001 -> 0001
 * 
 * // 查找
 * xxxx 是否存在 0001
 * xxxx & 0001 -> xxx1 存在 反之不存在
 * 
 * 
 * 
 */