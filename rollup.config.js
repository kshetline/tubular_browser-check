// noinspection JSUnusedGlobalSymbols

import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'src/browser-check.js',
    output: {
      file: 'dist/browser-check.min.js',
      format: 'es'
    },
    plugins: [
      sourcemaps(),
      terser({ output: { max_line_len: 511 } }),
      copy({
        targets: [
          { src: ['src/browser-check.js', 'src/incompatible.html'], dest: 'dist/' }
        ]
      })
    ],
    onwarn: function (warning, warn) {
      if (warning.code !== 'EVAL')
        warn(warning);
    }
  }
];
