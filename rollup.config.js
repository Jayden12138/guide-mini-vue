import typescript from '@rollup/plugin-typescript';
export default {
  input: './packages2/vue/src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'packages2/vue/dist/guide-mini-vue.cjs.js',
    },
    {
      format: 'es',
      file: 'packages2/vue/dist/guide-mini-vue.esm.js',
    },
  ],
  plugins: [typescript()],
};
