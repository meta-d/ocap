import { Property, PropertyDimension } from '@metad/ocap-core'
import { uuid } from 'apps/cloud/src/app/@core'
import { mapToTableColumnType } from '../../types'

/**
 * 
 * @param column 
 * @param isXmla 转成 olap 的维度，否则转成 sql 维度
 * @returns 
 */
export function newDimensionFromColumn(column: Property, isXmla: boolean = false) {
  return {
    __id__: uuid(),
    name: column.name,
    caption: column.caption,
    defaultHierarchy: column.defaultHierarchy,
    semantics: column.semantics,
    hierarchies: [
      {
        __id__: uuid(),
        name: '',
        hasAll: isXmla, // olap 的维度默认有 All 成员， sql 维度默认没有 All 成员
        visible: true,
        levels: [
          {
            __id__: uuid(),
            name: column.name,
            caption: column.caption,
            column: column.name,
            type: mapToTableColumnType(column.dataType), 
            visible: true,
          }
        ]
      }
    ]
  } as PropertyDimension
}
