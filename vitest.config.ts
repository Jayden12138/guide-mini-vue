import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        globals: true
    },
    resolve: {
        alias: [
            {
                find: /@guide-mini-vue\/(\w*)/,
                replacement: path.resolve(__dirname, "packages2") + "/$1/src"
            }
        ]
    }
})