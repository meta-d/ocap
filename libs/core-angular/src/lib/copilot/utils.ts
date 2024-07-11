import { Cube, EntityType, getEntityDimensions, getEntityMeasures, getEntityVariables } from '@metad/ocap-core'

/**
 * @deprecated use markdownEntityType
 */
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
  const variables = getEntityVariables(entityType)
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
` + (variables.length ? 
`variables:
${variables.map((variable) => 
`  - name: ${variable.name}
    caption: ${variable.caption}
    referenceDimension: ${variable.referenceDimension}
    referenceHierarchy: ${variable.referenceHierarchy}
    defaultValueKey: ${variable.defaultLow || ''}
    defaultValueCaption: ${variable.defaultLowCaption || ''}`
).join('\n')}`
: '')
}

export function markdownModelCube({modelId, dataSource, cube}: {modelId: string; dataSource: string; cube: EntityType}) {
  return `The model id is: ${modelId || 'N\\A'}` + `\nThe dataSource is: ${dataSource || 'N\\A'}` +
    `\n` + (cube ? markdownEntityType(cube) : '')
}

/**
 * @deprecated use markdownCube
 */
export function makeCubePrompt(cube: Cube) {
  return JSON.stringify({
    name: cube.name,
    caption: cube.caption,
    dimensions: cube.dimensions?.map((dimension) => ({
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
    measures: cube.measures?.map((item) => ({
      name: item.name,
      caption: item.caption
    })),
    calculatedMembers: cube.calculatedMembers?.map((item) => ({
      name: item.name,
      caption: item.caption,
      formula: item.formula
    })),
    /**
     * @todo Add dimensions
     */
    dimensionUsages: cube.dimensionUsages?.map((item) => ({
      name: item.name,
      caption: item.caption
    }))
  })
}

/**
 * @deprecated use markdownTable
 */
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

export function markdownTable(table: EntityType) {
  if (!table) {
    return `No table info.`
  }
  const columns = Object.values(table.properties)
  return [
    `Table is:`,
    `  - name: ${table.name}`,
    `    caption: ${table.caption || ''}`,
    `    columns:`,
    columns
      .map((t) =>
        [
          `    - name: ${t.name}`,
          `      caption: ${t.caption || ''}`,
          `      type: ${t.dataType || ''}`
        ].join('\n')
      )
      .join('\n'),
    '```'
  ].join('\n')
}