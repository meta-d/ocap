import { ModelQueryState } from '../types'

export function initModelQueryState(modelId: string, key: string, statement?: string): ModelQueryState {
  return {
    key,
    query: {
      key,
      modelId,
      name: 'Untitled_1',
      entities: [],
      statement
    },
    dirty: true,
    results: []
  }
}
