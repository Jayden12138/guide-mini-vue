import pkg from './package.json' assert { type: 'json' };
import typescript from '@rollup/plugin-typescript';
export default {
  input: './packages/index.ts',
  output: [
    {
      format: 'cjs',
      file: pkg.main,
    },
    {
      format: 'es',
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
