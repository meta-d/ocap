import { IChatBIModel } from '@metad/contracts'

export function markdownCubes(models: IChatBIModel[]) {
    return models.map((item) => `- modelId: ${item.modelId}
  cubeName: ${item.entity}
  cubeCaption: ${item.entityCaption}
  cubeDescription: ${item.entityDescription}`).join('\n')
}