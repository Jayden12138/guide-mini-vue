export * from '../src/shapeFlags';
export * from './toDisplayString'

export const EMPTY_OBJ = {};

export const hasOwn = (val, key) =>
      Object.prototype.hasOwnProperty.call(val, key);

    

export const isOn = (key: string) => /^on[A-Z]/.test(key);



export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : '';
  });
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
};

export const isString = (val: any) => typeof val === 'string'