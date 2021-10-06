module.exports = {
  parser: '@typescript-eslint/parser',
  env: {},
  root: true,
  ignorePatterns: [
    '/lib/**/*',
    '/coverage/**/*'
  ],
  overrides: [
    {
      files: [
        '*.test.js'
      ],
      rules: {
        'react/react-in-jsx-scope': 'off'
      }
    }
  ],
  plugins: [
    'react-hooks',
    '@typescript-eslint',
    'import'
  ],
  extends: [
    'godaddy-react',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'import/no-default-export': 2,
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'generator-star-spacing': 0,
    'no-use-before-define': 0,
    'spaced-comment': 0,
    'react/jsx-curly-spacing': 0,
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'require-atomic-updates': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: [
          'Link'
        ],
        specialLink: [
          'route',
          'as'
        ],
        aspects: [
          'invalidHref',
          'preferButton'
        ]
      }
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        controlComponents: [
          'DatePicker',
          'TimePicker'
        ]
      }
    ]
  }
};
