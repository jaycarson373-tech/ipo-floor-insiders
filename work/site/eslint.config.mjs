import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    '.node_modules-stale/**',
    'dist/**',
    'dist-fileprovider-stale-*/**',
    'out/**',
    'build/**',
    'public/collection/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
