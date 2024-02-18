import { isTracking, trackEffects, triggerEffects } from "./effect"
import { hasChanged } from "./shared"

class RefImpl {
    private _value: any
    public dep
    constructor(value: any) {
        this._value = value
        this.dep = new Set()
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        if (hasChanged(newValue, this._value)) {
            this._value = newValue;
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

