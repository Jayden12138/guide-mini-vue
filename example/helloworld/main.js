// import { createApp } from '../../node_modules/vue/dist/vue.esm-browser.js'
import { createApp } from '../../lib/mini-vue.esm.js'
import { App } from './App.js'

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer);