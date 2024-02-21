import { h, ref } from '../../lib/mini-vue.esm.js';

// 双端对比 的 核心 是找出中间乱序的部分

// 1. 左侧的对比
// (a b) c
// (a b) d e
const prevChildren = [
    h('p', { key: 'A' }, "A"),
    h('p', { key: 'B' }, "B"),
    h('p', { key: 'C' }, "C"),
]
const nextChildren = [
    h('p', { key: 'A' }, "A"),
    h('p', { key: 'B' }, "B"),
    h('p', { key: 'D' }, "D"),
    h('p', { key: 'E' }, "E"),
]

// 2. 右侧的对比
// a (b c)
// d e (b c)
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
// ]


// 3. 新的比老的长 创建新的
// 左侧
// (a b)
// (a b) c
// i = 2, e1 = 1, e2 = 2
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
// ]

// 右侧
// (a b)
// c (a b)
// i = 0, e1 = -1, e2 = 0
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
// ]
// const nextChildren = [
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
// ]

// 4. 老的比新的长
// 删除老的
// 左侧
// (a b) c
// (a b)
// i = 2, e1 = 2, e2 = 1
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
// ]

// 右侧
// a (b c)
// (b c)
// i = 0, e1 = 0, e2 = -1
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
// ]
// const nextChildren = [
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
// ]


// 5. 中间对比
// 删除老的(老的里面存在，新的里面不存在)
// 5.1
// a b (c d) f g
// a b (e c) f g
// D 节点在新的里面没有需要删除
// C 节点 props 也发生了变化
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C', id: 'c-prev' }, "C"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'C', id: 'c-next' }, "C"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]

// 5.1
// a b (c e d) f g
// a b (e c) f g
// 当所有的新的节点都对比完了，老节点还存在元素，这些元素都可以被删除
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C', id: 'c-prev' }, "C"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'Z' }, "Z"),
//     h('p', { key: 'X' }, "X"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'C', id: 'c-next' }, "C"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]


// 5.2 移动
// a b (c d e) f g
// a b (e c d) f g
// 只需要移动e
// 寻找最长递增子序列 这些是不需要改变的，除了这个子序列之外的是不稳定的元素，需要进行移动 （ 算法： 最长递增子序列）
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]


// 5.3 创建
// a b (c e) f g
// a b (e c d) f g
// d 节点在老的节点中不存在 新的里面存在，所以需要创建
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]

// 6. 综合
// a b (c d e z) f g
// a b (d c y e) f g
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'Z' }, "Z"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'D' }, "D"),
//     h('p', { key: 'C' }, "C"),
//     h('p', { key: 'Y' }, "Y"),
//     h('p', { key: 'E' }, "E"),
//     h('p', { key: 'F' }, "F"),
//     h('p', { key: 'G' }, "G"),
// ]

// fix bug
// c 节点应该是move而不是 删除之后重新创建的
// 1. 可以进去 到 中间对比
// 2. 前一个child.key 是 undefined
/** 这里应该是j <= e2
 * for (let j = s2; j < e2; j++) {
        if(isSomeVNodeType(prevChild, c2[j])){
            // 在新的里面存在
            newIndex = j
            break;
        }
        
    }
 */
// const prevChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', {}, "C"),
//     h('p', { key: 'B' }, "B"),
//     h('p', { key: 'D' }, "D"),
// ]
// const nextChildren = [
//     h('p', { key: 'A' }, "A"),
//     h('p', { key: 'B' }, "B"),
//     h('p', {}, "C"),
//     h('p', { key: 'D' }, "D"),
// ]



export default {
    name: 'ArrayToText',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },
    render(){
        const self = this;
        return self.isChange === true
        ? h('div', {}, nextChildren)
        : h('div', {}, prevChildren)
    }
}