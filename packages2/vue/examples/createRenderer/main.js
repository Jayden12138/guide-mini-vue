import { createRenderer } from '../../lib/mini-vue.esm.js'
import { App } from './App.js'
console.log(PIXI)

const game = new PIXI.Application({
    width: 300,
    height: 300
})

document.body.appendChild(game.view)

const renderer = createRenderer({
    createElement(type) {
        if (type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xFF0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()
            return rect
        }
  },
    patchProp(el, key, val) {
        el[key] = val
    },
    insert(el, container) {
        container.addChild(el)
    },
});

renderer.createApp(App).mount(game.stage)