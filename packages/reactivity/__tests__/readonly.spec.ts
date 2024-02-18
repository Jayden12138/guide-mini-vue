import { readonly } from "../src"

describe('readonly', () => {

    it('happy path', () => {
        const original = { foo: 1 }
        const observed = readonly(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
    })
})