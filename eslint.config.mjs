import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'prefer-const': 'warn',

      // Style enforcement rules (warnings initially, will become errors later)
      'react/forbid-dom-props': [
        'warn',
        {
          forbid: [
            {
              propName: 'style',
              message:
                'Use Tailwind classes instead of inline styles. See docs/GLOBAL_STYLE_SYSTEM.md',
            },
          ],
        },
      ],

      // Warn about potential hex color usage
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message:
            'Use semantic color tokens (e.g., brand-primary) instead of hex values. See docs/GLOBAL_STYLE_SYSTEM.md',
        },
        {
          selector: 'TemplateElement[value.raw=/\\b(rgb|rgba|hsl|hsla)\\(/]',
          message:
            'Use semantic color tokens instead of color functions. See docs/GLOBAL_STYLE_SYSTEM.md',
        },
        {
          selector:
            'JSXAttribute[name.name="className"][value.value=/\\b(gray|blue|red|green|yellow|purple|pink|indigo)-[0-9]+\\b/]',
          message:
            'Use semantic color tokens (e.g., content-body) instead of Tailwind default colors. See docs/GLOBAL_STYLE_SYSTEM.md',
        },
      ],
    },
  },
];

export default eslintConfig;
