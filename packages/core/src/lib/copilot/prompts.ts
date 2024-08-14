import { EntityType, getDimensionHierarchies, getEntityDimensions, getEntityMeasures, getEntityVariables, getHierarchyLevels, RuntimeLevelType, VariableEntryType } from "../models";
import { nonBlank } from "../utils";

export function prepend(prefix: string, text: string) {
    return text?.split('\n').map(line => prefix + line).join('\n') ?? ''
  }

export function markdownEntityType(entityType: EntityType) {
    const variables = getEntityVariables(entityType)
    return `The cube definition for (${entityType.name}) is as follows:
  name: ${entityType.name}
  caption: ${entityType.caption || ''}
  description: >
  ${prepend('  ', entityType.description || entityType.caption)}
  dimensions:
  ${getEntityDimensions(entityType)
      .map((dimension) =>
  [
    `  - name: "${dimension.name}"`,
    `    caption: "${dimension.caption || ''}"`,
    dimension.description ?
  `    description: >
  ${prepend('      ', dimension.description)}` : null,
    dimension.semantics?.semantic ? 
    `    semantic: ${dimension.semantics.semantic}` : null,
    `    hierarchies:`
  ].filter(nonBlank).join('\n') + '\n' +
  getDimensionHierarchies(dimension).map((item) =>[
  `      - name: "${item.name}"`,
  `        caption: "${item.caption || ''}"`,
  item.description ?
  `        description: >
  ${prepend('          ', item.description)}` : null,
  `        levels:
  ${getHierarchyLevels(item).filter((level) => level.levelType !== RuntimeLevelType.ALL).map((item) =>
  [
  `          - name: "${item.name}"`,
  `            caption: "${item.caption || ''}"`,
  item.description ?
  `            description: >
  ${prepend('              ', item.description)}` : null,
  item.semantics?.semantic ?
  `            semantic: ${item.semantics.semantic}` : null,
  item.semantics?.formatter ? 
  `            time_formatter: "${item.semantics.formatter}"` : null,
  ].filter(nonBlank).join('\n')).join('\n')}
  `].join('\n')).join('\n') ?? ''
  ).join('\n')}
  measures:
  ${getEntityMeasures(entityType).map((item) => 
    [
      `  - name: "${item.name}"`,
      `    caption: ${item.caption || ''}`,
      item.description ? 
      `    description: >
  ${prepend('      ', item.description)}` : null,
      item.formatting?.unit ?
      `    unit: ${item.formatting.unit}` : null
    ].filter(nonBlank).join(`\n`)
  ).join('\n')}
  ` + (variables.length ? 
  `variables:
  ${variables.map((variable) =>
    [
    `  - name: ${variable.name}`,
    `    caption: ${variable.caption}`,
    `    referenceDimension: ${variable.referenceDimension}`,
    `    referenceHierarchy: ${variable.referenceHierarchy}`,
    variable.variableEntryType === VariableEntryType.Required?
    `    required: true` : null,
    variable.defaultLow?
    `    defaultValueKey: ${variable.defaultLow}` : null,
    variable.defaultLowCaption?
    `    defaultValueCaption: ${variable.defaultLowCaption}` : null,
    ``,
    ].filter(nonBlank).join(`\n`)
  ).join('\n')}`
  : '')
  }
  
  export function markdownModelCube({modelId, dataSource, cube}: {modelId: string; dataSource: string; cube: EntityType}) {
    return `The model id is: ${modelId || 'N\\A'}` + `\nThe dataSource is: ${dataSource || 'N\\A'}` +
      `\n` + (cube ? markdownEntityType(cube) : '')
  }