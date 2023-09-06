import { SelectionModel } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { AggregationRole, DimensionUsage, DisplayBehaviour, EntityProperty, isVisible, PropertyDimension } from '@metad/ocap-core'
import { assign, isNil, omit } from 'lodash-es'
import { ModelDesignerType } from '../../types'
import { ModelEntityService } from '../entity.service'

/**
 * Node for Property item
 */
export class PropertyItemNode implements EntityProperty {
  children?: PropertyItemNode[]
  id: string
  name: string
  label: string
  role: AggregationRole
  readonly?: boolean
}

/** Flat Property item node with expandable and level information */
export class PropertyItemFlatNode {
  id: string
  name: string
  label: string
  level: number
  expandable: boolean
  role: AggregationRole
  readonly: boolean
}

@Component({
  selector: 'pac-property-dimension',
  templateUrl: 'dimension.component.html',
  host: {
    class: 'pac-property-dimension'
  }
})
export class PropertyDimensionComponent implements OnInit, OnChanges {
  AGGREGATION_ROLE = AggregationRole
  isVisible = isVisible

  @Input() dimension: PropertyDimension
  @Input() usage: DimensionUsage
  @Input() readonly: boolean
  @Input() checklistSelection: SelectionModel<string>
  @Input() displayBehaviour: DisplayBehaviour

  @Output() toDimension = new EventEmitter()
  @Output() newItem = new EventEmitter()
  @Output() delete = new EventEmitter()

  dataSource: MatTreeFlatDataSource<PropertyItemNode, PropertyItemFlatNode, string>
  /** The selection for checklist */
  flatNodeMap = new Map<PropertyItemFlatNode, PropertyItemNode>()
  nestedNodeMap = new Map<PropertyItemNode, PropertyItemFlatNode>()

  transformer = (node: PropertyItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node)
    const flatNode = existingNode && existingNode.name === node.name ? existingNode : new PropertyItemFlatNode()
    // 复制属性
    assign(flatNode, omit(node, ['children']))
    flatNode.level = level
    flatNode.expandable = !!node.children?.length

    this.flatNodeMap.set(flatNode, node)
    this.nestedNodeMap.set(node, flatNode)
    return flatNode
  }
  hasChild = (_: number, _nodeData: PropertyItemFlatNode) => _nodeData.expandable
  getLevel = (node: PropertyItemFlatNode) => node.level
  getChildren = (node: PropertyItemNode): PropertyItemNode[] => node.children
  isExpandable = (node: PropertyItemFlatNode) => node.expandable
  treeFlattener: MatTreeFlattener<PropertyItemNode, PropertyItemFlatNode, string> = new MatTreeFlattener(
    this.transformer,
    this.getLevel,
    this.isExpandable,
    this.getChildren
  )
  treeControl = new FlatTreeControl<PropertyItemFlatNode, string>(this.getLevel, this.isExpandable, {
    trackBy: (dataNode: PropertyItemFlatNode) => dataNode.id
  })

  constructor(public cubeState: ModelEntityService) {
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
    this.dataSource.data = []
  }

  ngOnInit() {}

  ngOnChanges({ dimension }: SimpleChanges) {
    if (dimension?.currentValue) {
      this.update(dimension.currentValue)
    }
  }

  update(dimension: PropertyDimension) {
    this.dataSource.data = [
      {
        ...dimension,
        id: dimension.__id__,
        role: AggregationRole.dimension,
        isUsage: !!this.usage,
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
      } as PropertyItemNode
    ]
  }

  isSelected(node) {
    if (this.usage) {
      if (node.role === AggregationRole.dimension) {
        return this.checklistSelection?.isSelected(ModelDesignerType.dimensionUsage+'#'+this.usage.__id__)
      }
    } else {
      return this.checklistSelection?.isSelected(node.role+'#'+node.id)
    }
    return false
  }

  onSelect(node) {
    if (this.usage) {
      if (node.role === AggregationRole.dimension) {
        this.checklistSelection.toggle(`${ModelDesignerType.dimensionUsage}#${this.usage.__id__}`)
      }
    } else {
      this.checklistSelection.toggle(`${node.role}#${node.__id__}`)
    }
  }

  drop(event) {
    console.warn(event)
  }

  addNewItem(event, node: PropertyItemFlatNode) {
    event.stopPropagation()
    if (!isNil(node)) {
      this.treeControl.expand(node)
      this.newItem.emit({ id: node.id, role: node?.role })
    }
  }

  onDelete(event, node: PropertyItemFlatNode) {
    event.stopPropagation()
    if (this.usage) {
      this.delete.emit(this.usage.__id__)
    } else {
      this.delete.emit(node.id)
    }
  }

}
