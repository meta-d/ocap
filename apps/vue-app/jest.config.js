module.exports = {
  displayName: 'vue-app',
  preset: '../../jest.preset.js',
  transform: {
    '^.+.vue$': 'vue3-jest',
    '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
  coverageDirectory: '../../coverage/apps/vue-app',
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'ts-jest': {
      tsconfig: 'apps/vue-app/tsconfig.spec.json',
      babelConfig: 'apps/vue-app/babel.config.js'
    },
    'vue-jest': {
      tsConfig: 'apps/vue-app/tsconfig.spec.json',
      babelConfig: 'apps/vue-app/babel.config.js'
    }
  }
}
