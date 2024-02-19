


export function emit(instance, event) {
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

  const handlerName = toHandlerKey(event);

  const handler = props[handlerName];
  handler && handler();
}


const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
}

