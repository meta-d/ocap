import { AggregationRole, PropertyDimension } from '@metad/ocap-core'

/**
 * Node for Property item
 */
export class TreeItemNode {
  children?: TreeItemNode[]
  id: string
  name: string
  label: string
  role: AggregationRole
}

/** Flat Property item node with expandable and level information */
export class TreeItemFlatNode {
  id: string
  name: string
  label: string
  level: number
  expandable: boolean
  role: AggregationRole
}

export function mapDimensionToTreeItemNode(dimension: PropertyDimension) {
  return {
    ...dimension,
    id: dimension.__id__,
    role: AggregationRole.dimension,
    label: dimension.caption,
    children: dimension.hierarchies?.map((hierarchy) => {
      return {
        ...hierarchy,
        label: hierarchy.caption,
        dimension: dimension.name,
        id: hierarchy.__id__,
        role: AggregationRole.hierarchy,
        children: hierarchy.levels?.map((level) => {
          return {
            ...level,
            dimension: dimension.name,
            hierarchy: hierarchy.name,
            id: level.__id__,
            role: AggregationRole.level,
            label: level.caption,
            children: null
          }
        })
      }
    })
  } as TreeItemNode
}