import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'

export default {
	input: './packages/vue/src/index.ts',
	output: [
		{
			format: 'cjs',
			file: 'packages/vue/dist/tiny-vue.cjs.js',
			// file: pkg.main,
		},
		{
			format: 'esm',
			file: 'packages/vue/dist/tiny-vue.esm.js',
			// file: pkg.module,
		},
	],
	plugins: [typescript(), commonjs()],
}
