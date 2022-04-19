module.exports = {
  displayName: 'vue',
  preset: '../../jest.preset.js',
  transform: {
    '^.+.vue$': 'vue3-jest',
    '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
  coverageDirectory: '../../coverage/packages/vue',
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'ts-jest': {
      tsconfig: 'packages/vue/tsconfig.spec.json',
      babelConfig: 'packages/vue/babel.config.js'
    },
    'vue-jest': {
      tsConfig: 'packages/vue/tsconfig.spec.json',
      babelConfig: 'packages/vue/babel.config.js'
    }
  }
}
