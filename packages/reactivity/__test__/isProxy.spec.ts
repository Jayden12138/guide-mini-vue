import { isProxy, reactive, readonly } from '../src/reactive'

describe('isProxy', () => {
	it('isProxy happy path reactive', () => {
		const original = { foo: 1, bar: { baz: 2 } }
		const observed = readonly(original)
		expect(isProxy(observed)).toBe(true)
	})
	it('isProxy happy path readonly', () => {
		const original = { foo: 1, bar: { baz: 2 } }
		const observed = reactive(original)
		expect(isProxy(observed)).toBe(true)
	})
})
