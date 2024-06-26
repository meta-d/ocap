import { Cube, EntityType, getEntityDimensions, getEntityMeasures } from '@metad/ocap-core'

export function calcEntityTypePrompt(entityType: EntityType) {
  return JSON.stringify({
    name: entityType.name,
    caption: entityType.caption,
    dimensions: getEntityDimensions(entityType).map((dimension) => ({
      name: dimension.name,
      caption: dimension.caption,
      hierarchies: dimension.hierarchies?.map((item) => ({
        name: item.name,
        caption: item.caption,
        levels: item.levels?.map((item) => ({
          name: item.name,
          caption: item.caption
        }))
      }))
    })),
    measures: getEntityMeasures(entityType).map((item) => ({
      name: item.name,
      caption: item.caption
    }))
  })
}

export function markdownEntityType(entityType: EntityType) {
  return `The cube definition for ${entityType.name} is as follows:
name: "${entityType.name}"
caption: "${entityType.caption || ''}"
dimensions:
${getEntityDimensions(entityType)
    .map((dimension) =>
`  - name: "${dimension.name}"
    caption: "${dimension.caption || ''}"
    hierarchies:
${dimension.hierarchies?.map((item) =>
`      - name: "${item.name}"
        caption: "${item.caption || ''}"
        levels:
${item.levels?.map((item) => {

  let result = 
`          - name: "${item.name}"
            caption: "${item.caption || ''}"`
  if (item.semantics?.formatter) {
    result += `\n            time_formatter: "${item.semantics.formatter}"`
  }
  return result
}
).join('\n')}
`).join('\n')}
`).join('\n')}
measures:
${getEntityMeasures(entityType).map((item) => `  - name: "${item.name}"
    caption: "${item.caption || ''}"`).join('\n')}
`
}

export function makeCubePrompt(cube: Cube) {
  return JSON.stringify({
    name: cube.name,
    caption: cube.caption,
    dimensions: cube.dimensions.map((dimension) => ({
      name: dimension.name,
      caption: dimension.caption,
      hierarchies: dimension.hierarchies?.map((item) => ({
        name: item.name,
        caption: item.caption,
        levels: item.levels?.map((item) => ({
          name: item.name,
          caption: item.caption
        }))
      }))
    })),
    measures: cube.measures.map((item) => ({
      name: item.name,
      caption: item.caption
    })),
    calculatedMembers: cube.calculatedMembers.map((item) => ({
      name: item.name,
      caption: item.caption,
      formula: item.formula
    })),
    /**
     * @todo Add dimensions
     */
    dimensionUsages: cube.dimensionUsages.map((item) => ({
      name: item.name,
      caption: item.caption
    }))
  })
}

export function makeTablePrompt(entityType: EntityType) {
  if (!entityType?.properties) {
    return undefined
  }
  return JSON.stringify({
    name: entityType.name,
    caption: entityType.caption ?? undefined,
    columns: Object.values(entityType.properties).map((item) => ({
      name: item.name,
      caption: item.caption ?? undefined,
      type: item.dataType
    }))
  })
}
