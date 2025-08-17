import { includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import { getDefaultCallees } from 'eslint-plugin-better-tailwindcss/api/defaults';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const compat = new FlatCompat({ baseDirectory: dirName });

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  jest.configs['flat/recommended'],
  jest.configs['flat/style'],

  includeIgnoreFile(gitignorePath),

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'better-tailwindcss': betterTailwind,
      prettier,
    },
    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      ...betterTailwind.configs['recommended-warn'].rules,

      'prettier/prettier': 'warn',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/globals.css',
        callees: [
          ...getDefaultCallees(),
          // add detection for custom tailwind class helper
          ['twMergeClsx', [{ match: 'strings' }, { match: 'objectKeys' }]],
        ],
      },
    },
  },
];

export default eslintConfig;
