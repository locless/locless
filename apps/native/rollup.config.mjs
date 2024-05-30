// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';

export default {
  plugins: [
    typescript(),
    babel({
      babelHelpers: 'runtime',
      presets: ['babel-preset-expo'],
      extensions: ['.js', '.jsx', '.tsx'],
    }),
  ],
};
