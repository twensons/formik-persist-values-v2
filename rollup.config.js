import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const globalPackages = {
  react: 'React',
  formik: 'formik',
  'prop-types': 'PropTypes',
};

const shared = {
  input: `compiled/PersistFormikValues.js`,
  plugins: [sourceMaps()],
  external: Object.keys(globalPackages),
};

export default [
  Object.assign({}, shared, {
    moduleName: 'PersistFormikValues',
    format: 'umd',
    output: {
      exports: 'named',
      sourcemap: true,
      global: globalPackages,
      file: 'dist/PersistFormikValues.umd.js',
    },
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
      }),
      sourceMaps(),
      terser(),
      filesize(),
    ],
  }),

  Object.assign({}, shared, {
    output: {
      exports: 'named',
      sourcemap: true,
      global: globalPackages,
      file: 'dist/PersistFormikValues.es6.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
      }),
      sourceMaps(),
      terser(),
    ],
  }),

  Object.assign({}, shared, {
    output: {
      exports: 'named',
      sourcemap: true,
      global: globalPackages,
      file: 'dist/PersistFormikValues.js',
      format: 'cjs',
    },
    plugins: [
      resolve(),
      commonjs({
        include: /node_modules/,
      }),
      sourceMaps(),
      terser(),
    ],
  }),
];
