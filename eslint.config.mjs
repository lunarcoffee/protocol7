import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import { includeIgnoreFile } from '@eslint/compat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const compat = new FlatCompat({ baseDirectory: dirName });

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

  ...tseslint.configs.recommended,

  includeIgnoreFile(gitignorePath),

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
];

export default eslintConfig;
