import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
	render() {
		window.self = this
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'hard'],
				onClick: () => {
					console.log('click')
				},
				onMousedown: () => {
					console.log('mouse down')
				},
			},
			// this
			// 'hi, ' + this.msg

			// string
			// 'hi jayden',

			// children
			// [
			// 	h('p', { class: 'red' }, 'hi'),
			// 	h('p', { class: 'blue' }, 'jayden'),
			// ]

			// props
			[
				h('div', {}, 'hi, ' + this.msg),
				h(Foo, {
					count: 1,
				}),
			]
		)
	},
	setup() {
		return {
			msg: 'jayden',
		}
	},
}
