export const extend = Object.assign

export const isObject = (val: any) => val !== null && typeof val === 'object'

export const hasChanged = (newVal: any, oldVal: any) => {
    return !Object.is(newVal, oldVal)
}