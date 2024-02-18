
/**
 * effect(()=>{}) 接收一个函数，依赖发生变化则执行fn，
 * 当执行fn时，如果遇到reactive包装的变量，则会出发get 在get中出发track 收集依赖，这里就是把当前的effect中的fn，保存起来
 * 当reactive包装的变量发生变化时，会触发set 在set中触发trigger trigger中会查询到之前保存的相关effect函数fn，遍历执行
 */

let activeEffect: any;
class ReactiveEffect {
  private _fn: any;
  constructor(fn: any) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
}


export function effect(fn: any) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()

    return _effect.run.bind(_effect)
}

const targetMap = new Map();
// 依赖收集
export function track(target: any, key: any) {
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key);
    if(!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    
    dep.add(activeEffect)
}

// 触发依赖
export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    dep.forEach((effect: any) => {
        effect.run()
    })
}