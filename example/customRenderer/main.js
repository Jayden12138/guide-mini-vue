import { createRenderer } from '../../lib/guide-mini-vue.esm.js'
import { App } from './App.js'
console.log(PIXI)

const game = new PIXI.Application()

await game.init({
	width: 300,
	height: 300,
})

document.body.appendChild(game.canvas)

const renderer = createRenderer({
	createElement(type) {
		if (type === 'rect') {
			const rect = new PIXI.Graphics()
			rect.rect(10, 10, 100, 100)
			rect.fill(0x0000ff)
			return rect
		}
	},
	patchProp(el, key, val) {
		el[key] = val
	},
	insert(el, container) {
		container.addChild(el)
	},
})

renderer.createApp(App).mount(game.stage)
