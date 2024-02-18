import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"
import { hasChanged, isObject } from "./shared"

class RefImpl {
    private _value: any
    private _rawValue: any
    public dep
    constructor(value: any) {
        this._rawValue = value
        this._value = isObject(value) ? reactive(value) : value

        // value -> reactive
        // 1. value isObject ? reactive(value) : value



        this.dep = new Set()
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue
            this._value = isObject(newValue) ? reactive(newValue) : newValue;
            triggerEffects(this.dep);
        }
    }
}

function trackRefValue(ref: any) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}


export function ref(value: any) {
    return new RefImpl(value)
}

