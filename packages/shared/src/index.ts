export * from '../src/shapeFlags';


export const hasOwn = (val, key) =>
      Object.prototype.hasOwnProperty.call(val, key);

    

export const isOn = (key: string) => /^on[A-Z]/.test(key);