
import { getCurrentInstance } from './component'


export function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
        let { provides } = currentInstance

        const parentProvides = currentInstance.parent?.provides

        if (provides === parentProvides) {
            // init 
            // 只在初始化时执行
            provides = currentInstance.provides = Object.create(parentProvides)
        }

        provides[key] = value
    }
}


export function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides

        if (key in parentProvides) {
            return parentProvides[key]
        }else if (defaultValue) {
            return defaultValue
        }
    }
}