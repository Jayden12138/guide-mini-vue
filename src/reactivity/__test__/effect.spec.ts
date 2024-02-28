import { effect } from '../src/effect'
import { reactive } from '../src/reactive'

describe('reactive', () => {
	it('happy path', () => {
		const original = { foo: 1 }
		const observed = reactive(original)
		expect(observed).not.toBe(original)
		expect(observed.foo).toBe(1)
	})

	it('should observe basic properties', () => {
		let dummy
		const obj = reactive({ prop: 1 })
		effect(() => {
			dummy = obj.prop
		})
		expect(dummy).toBe(1)
		obj.prop = 2
		expect(dummy).toBe(2)
	})

	it('should return runner when call effect', () => {
		let foo = 10
		const runner = effect(() => {
			foo++
			return 'foo'
		})

		expect(foo).toBe(11)
		const r = runner()
		expect(foo).toBe(12)
		expect(r).toBe('foo')
	})
})
