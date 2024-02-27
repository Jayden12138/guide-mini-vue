import { camelize, toHandlerKey } from "@guide-mini-vue/shared";



export function emit(instance, event, ...args) {
  console.log('emit: ', event);

  // instance.props -> event
  const { props } = instance;

  /**
   * TPP
   * 先特定行为 -> 重构为通用行为
   *
   * 特定
   * const handler = props['onAdd']
   * handler && handler()
   *
   * 通用
   * add -> Add
   * const handler = props[`on${capitalize(event)}`];
   *
   * Add -> onAdd
   * const handlerName = toHandlerKey(event)
   * const handler = props[handlerName]
   *
   */

  const handlerName = toHandlerKey(camelize(event));

  const handler = props[handlerName];
  handler && handler(...args);
}


