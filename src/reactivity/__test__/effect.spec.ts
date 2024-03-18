import { effect, reactive, stop } from '../src'

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

	it('scheduler', () => {
		let dummy
		let run: any
		const scheduler = jest.fn(() => {
			run = runner
		})
		const obj = reactive({ foo: 1 })
		const runner = effect(
			() => {
				dummy = obj.foo
			},
			{ scheduler }
		)
		expect(scheduler).not.toHaveBeenCalled()
		expect(dummy).toBe(1)
		// should be called on first trigger
		obj.foo++
		expect(scheduler).toHaveBeenCalledTimes(1)
		// should not run yet
		expect(dummy).toBe(1)
		// manually run
		run()
		// should have run
		expect(dummy).toBe(2)
	})

	it('stop', () => {
		let dummy
		const obj = reactive({ prop: 1 })
		const runner = effect(() => {
			dummy = obj.prop
		})
		obj.prop = 2
		expect(dummy).toBe(2)
		stop(runner)
		obj.prop = 3
		expect(dummy).toBe(2)

		// stopped effect should still be manually callable
		runner()
		expect(dummy).toBe(3)
	})
})
