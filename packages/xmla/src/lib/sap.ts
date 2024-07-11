import {
  EntityProperty,
  FilterOperator,
  getMemberValue,
  IMember,
  ParameterControlEnum,
  PrimitiveType,
  wrapHierarchyValue
} from '@metad/ocap-core'
import { isArray } from 'lodash'
import { MDXHierarchyFilter } from './filter'

export enum VariableEntryType {
  None,
  Required
}

export enum VariableSelectionType {
  Unknown,
  Unknown1,
  SingleRange,
  SingleValue,
  MultipleValue
}


export interface SAPVariableParameter extends EntityProperty {
  paramType: ParameterControlEnum
  value?: PrimitiveType | IMember[]
  availableMembers?: Array<IMember>
  variableName?: string
  hierarchy?: string
  dimension?: string
  variableEntryType?: VariableEntryType
  variableSelectionType?: VariableSelectionType
}

export function serializeSAPVariables(parameters: SAPVariableParameter[]) {
  return parameters.filter((parameter) => Array.isArray(parameter.value) && parameter.value?.length)
    .map((parameter) => {
      const members = Array.isArray(parameter.value) ? parameter.value : [{value: parameter.value as string}]
      let value
      if (parameter.variableSelectionType === VariableSelectionType.SingleValue) {
        value = wrapHierarchyValue(parameter.hierarchy, `${members[0].value}`)
      } else if (parameter.variableSelectionType === VariableSelectionType.MultipleValue) {
        value = members.map((member) => wrapHierarchyValue(parameter.hierarchy, `${member.value}`)).join(',')
      } else if (parameter.variableSelectionType === VariableSelectionType.SingleRange) {
        if (members.length < 2) {
          throw new Error(`参数 ${parameter.name} 需要设置为区间`)
        }

        value = `${wrapHierarchyValue(parameter.hierarchy, `${members[0].value}`)}:${wrapHierarchyValue(parameter.hierarchy, `${members[1].value}`)}`
      }

      return `${parameter.name} INCLUDING ${value}`
    })
    .join(' ')
}

export function mapHierarchyFilterToSAPVariable(name: string, filter: MDXHierarchyFilter) {
  const hierarchy = filter.hierarchy || filter.dimension
  if (filter.operator === FilterOperator.BT) {
    return [
      `${name} INCLUDING ${wrapHierarchyValue(hierarchy,
        getMemberValue(filter.members[0])
      )}:${wrapHierarchyValue(hierarchy, getMemberValue(filter.members[1]))}`
    ]
  }
  if (isArray(filter.members)) {
    return filter.members.map(
      (member) => `${name} INCLUDING ${wrapHierarchyValue(hierarchy, getMemberValue(member))}`
    )
  }

  // todo
  // return [`${name} INCLUDING ${wrapHierarchyValue(hierarchy, filter.members)}`]

  return []
}
