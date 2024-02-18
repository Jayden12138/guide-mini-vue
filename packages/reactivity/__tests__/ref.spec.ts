import { ref } from "../src"

describe('ref', () => {

    it('happy path', () => {
        const a = ref(1)
        expect(a.value).toBe(1)
    })
})