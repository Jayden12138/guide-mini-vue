export function initSlots(instance, children) {
    normalizeObjectSlots(children, instance.slots)
}


function normalizeObjectSlots(children: any, slots: any) {
    for (const key in children) {
        const value = children[key]

        // slot
        slots[key] = (props) => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue(val) {
    return Array.isArray(val) ? val : [val]
}