export function initSlots(instance, children) {
    const { vnode } = instance
    instance.slots = children;
}