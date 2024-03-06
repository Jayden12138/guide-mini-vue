import {
	h,
	renderSlots,
	getCurrentInstance,
} from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
	name: 'Foo',
	setup() {
		const instance = getCurrentInstance()
		console.log('Foo instance: ', instance)
		return {}
	},
	render() {
		const foo = h('p', {}, 'foo')
		const age = 1

		return h('div', {}, [
			renderSlots(this.$slots, 'header', { age }),
			foo,
			renderSlots(this.$slots, 'footer'),
		])
	},
}
