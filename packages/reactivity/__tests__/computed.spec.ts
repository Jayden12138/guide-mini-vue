import { computed, reactive } from "../src"


describe('computed', () => {
    it('happy path', () => {
        const user = reactive({ age: 1 })
        const age = computed(() => user.age)
        expect(age.value).toBe(1)
    })
})