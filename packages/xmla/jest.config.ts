/* eslint-disable */
export default {
  displayName: 'xmla',
  preset: '../../jest.preset.js',
  globals: {},
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/xmla',
  transformIgnorePatterns: ['../../node_modules/(?!(lodash-es)/)']
}
