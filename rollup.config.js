import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'

import pkg from './package.json'

export default {
	input: './src/index.ts',
	output: [
		{
			format: 'cjs',
			// file: 'lib/guide-mini-vue.cjs.js',
			file: pkg.main,
		},
		{
			format: 'esm',
			// file: 'lib/guide-mini-vue.esm.js',
			file: pkg.module,
		},
	],
	plugins: [typescript(), commonjs()],
}
