import { isReactive, isReadonly, reactive, readonly } from '../src/reactive'

describe('reactive', () => {
	it('isReactive happy path', () => {
		const original = { foo: 1 }
		const observed = reactive(original)
		expect(observed).not.toBe(original)
		expect(observed.foo).toBe(1)
		expect(isReactive(observed)).toBe(true)
		expect(isReactive(original)).toBe(false)
	})

	it('isReadonly happy path', () => {
		const original = { foo: 1 }
		const observed = readonly(original)
		expect(observed).not.toBe(original)
		expect(observed.foo).toBe(1)
		expect(isReadonly(observed)).toBe(true)
		expect(isReadonly(original)).toBe(false)
	})
})
