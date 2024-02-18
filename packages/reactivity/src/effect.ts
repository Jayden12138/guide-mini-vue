
/**
 * effect(()=>{}) 接收一个函数，依赖发生变化则执行fn，
 * 当执行fn时，如果遇到reactive包装的变量，则会出发get 在get中出发track 收集依赖，这里就是把当前的effect中的fn，保存起来
 * 当reactive包装的变量发生变化时，会触发set 在set中触发trigger trigger中会查询到之前保存的相关effect函数fn，遍历执行
 */

import { extend } from "./shared";

let activeEffect: any;
let shouldTrack: any;
class ReactiveEffect {
  active = true;
  deps = [];
  onStop?: () => void;
  constructor(public fn: any, public scheduler?: any) {}
  run() {
    activeEffect = this;

    if (!this.active) {
      return this.fn();
    }

    shouldTrack = true;
    const result = this.fn()

    // reset
    shouldTrack = false;

    return result
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      if(this.onStop) {
        this.onStop()
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}


export function effect(fn: any, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // _effect.onStop = options.onStop
  // Object.assign(_effect, options) // 挂载多个属性
  extend(_effect, options) // 抽离出去改个名字
  
  _effect.run()

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

const targetMap = new Map();
// 依赖收集
export function track(target: any, key: any) {
  if (!isTracking()) return; // 小优化 如果不进行收集，那targetmap depsmap等都不需要获取/创建

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
  trackEffects(dep)
}

export function trackEffects(dep: any) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  (activeEffect as any).deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

// 触发依赖
export function trigger(target: any, key: any) {
    const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep)
}

export function triggerEffects(dep: any) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run();
        }
    }
}


export function stop(runner: any) {
    runner.effect.stop()
}