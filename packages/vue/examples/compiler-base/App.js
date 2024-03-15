import { ref } from '../../dist/tiny-vue.esm.js'
export const App = {
	name: 'App',
	template: `<div>hi, {{ msg }}, {{count}}</div>`,
	setup() {
		const count = (window.count = ref(1))
		return {
			msg: 'Jayden',
			count,
		}
	},
}
