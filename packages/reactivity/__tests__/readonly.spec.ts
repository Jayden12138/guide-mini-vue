import { isReadonly, readonly } from "../src"

describe('readonly', () => {

    it('happy path', () => {
        const original = { foo: 1 }
        const observed = readonly(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
        expect(isReadonly(observed)).toBe(true)
        expect(isReadonly(original)).toBe(false);
    })

    it('should not allow reassignment', () => {
        console.warn = jest.fn()
        const original = { foo: 1 }
        const observed = readonly(original)
        observed.foo = 2
        expect(console.warn).toHaveBeenCalled()
    })
})