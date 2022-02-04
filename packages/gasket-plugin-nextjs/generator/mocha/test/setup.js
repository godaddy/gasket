require('@babel/register')({
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          modules: 'commonjs'
        }
      }
    ]
  ]
});
