import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { fileURLToPath } from 'url';
import path from 'path';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    ...compat.extends('next/core-web-vitals'),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-object-type': 'off',
            'no-unused-vars': 'off', // Turn off base rule as it can conflict with TS rule
            'prefer-const': 'warn',
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'react/no-unescaped-entities': 'warn',
            'react/jsx-no-undef': 'warn',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
        },
    },
    {
        files: ['lib/logger.ts', '*.config.*', 'next.config.*', 'postcss.config.*', 'tailwind.config.*', 'vitest.config.*', 'jest.*', 'scripts/**'],
        rules: {
            'no-console': 'off',
        },
    },
];
