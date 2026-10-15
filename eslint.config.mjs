import { includeIgnoreFile } from '@eslint/config-helpers';
import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import next from '@next/eslint-plugin-next';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/api/defaults';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const eslintConfig = [
    next.configs.recommended,
    next.configs['core-web-vitals'],

    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintReact.configs['recommended-typescript'],

    includeIgnoreFile(gitignorePath),

    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            'better-tailwindcss': betterTailwind,
            prettier,
        },
        rules: {
            quotes: ['warn', 'single', { allowTemplateLiterals: false }],

            'simple-import-sort/imports': 'warn',
            'simple-import-sort/exports': 'warn',

            ...betterTailwind.configs['recommended-warn'].rules,
            'better-tailwindcss/enforce-consistent-line-wrapping': [
                'warn',
                { printWidth: 110, indent: 4, strictness: 'loose' },
            ],

            'prettier/prettier': 'warn',

            '@next/next/no-img-element': 'off',
        },
        settings: {
            'react-x': { additionalEffectHooks: '/^usePromise$/u' },

            'better-tailwindcss': {
                entryPoint: 'app/globals.css',
                selectors: [
                    ...getDefaultSelectors(),
                    // add detection for custom tailwind class helper
                    {
                        kind: 'callee',
                        name: '^twMergeClsx$',
                        match: [{ type: 'strings' }, { type: 'objectKeys' }],
                    },
                ],
            },
        },
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
];

export default eslintConfig;
