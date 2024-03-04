import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
	setup(props, { emit }) {
		const emitAdd = () => {
			console.log('emit add')
			emit('add', 1, 2)
			emit('add-foo')
		}

		return {
			emitAdd,
		}
	},
	render() {
		const btn = h(
			'button',
			{
				onClick: this.emitAdd,
			},
			'emit add'
		)
		const foo = h('p', {}, 'foo')
		return h('div', {}, [btn, foo])
	},
}
