// import { FlatTreeControl } from '@angular/cdk/tree'
// import { CommonModule } from '@angular/common'
// import { Component, EventEmitter, Input, Output, effect, inject, input } from '@angular/core'
// import { FormsModule } from '@angular/forms'
// import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
// import { NxActionStripModule } from '@metad/components/action-strip'
// import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
// import {
//   AggregationRole,
//   DimensionUsage,
//   DisplayBehaviour,
//   EntityProperty,
//   PropertyAttributes,
//   PropertyDimension,
//   isVisible
// } from '@metad/ocap-core'
// import { MaterialModule } from 'apps/cloud/src/app/@shared'
// import { assign, isNil, omit } from 'lodash-es'
// import { ModelDesignerType } from '../../types'
// import { ModelEntityService } from '../entity.service'

// /**
//  * Node for Property item
//  */
// export class PropertyItemNode implements EntityProperty {
//   children?: PropertyItemNode[]
//   id: string
//   name: string
//   label: string
//   role: AggregationRole
//   readonly?: boolean
// }

// /** Flat Property item node with expandable and level information */
// export class PropertyItemFlatNode {
//   id: string
//   name: string
//   label: string
//   level: number
//   expandable: boolean
//   role: AggregationRole
//   readonly: boolean
// }

// @Component({
//   standalone: true,
//   selector: 'pac-property-dimension',
//   templateUrl: 'dimension.component.html',
//   host: {
//     class: 'pac-property-dimension'
//   },
//   imports: [CommonModule, FormsModule, MaterialModule, NgmEntityPropertyComponent, NxActionStripModule]
// })
// export class PropertyDimensionComponent {
//   AGGREGATION_ROLE = AggregationRole
//   isVisible = isVisible

//   public cubeState = inject(ModelEntityService)

//   readonly dimension = input<PropertyDimension>(null)

//   @Input() usage: DimensionUsage
//   @Input() readonly: boolean
//   // @Input() checklistSelection: SelectionModel<string>
//   @Input() displayBehaviour: DisplayBehaviour

//   @Output() toDimension = new EventEmitter()
//   @Output() newItem = new EventEmitter()
//   @Output() delete = new EventEmitter()

//   /** The selection for checklist */
//   flatNodeMap = new Map<PropertyItemFlatNode, PropertyItemNode>()
//   nestedNodeMap = new Map<PropertyItemNode, PropertyItemFlatNode>()

//   transformer = (node: PropertyItemNode, level: number) => {
//     const existingNode = this.nestedNodeMap.get(node)
//     const flatNode = existingNode && existingNode.name === node.name ? existingNode : new PropertyItemFlatNode()
//     // 复制属性
//     assign(flatNode, omit(node, ['children']))
//     flatNode.level = level
//     flatNode.expandable = !!node.children?.length

//     this.flatNodeMap.set(flatNode, node)
//     this.nestedNodeMap.set(node, flatNode)
//     return flatNode
//   }
//   hasChild = (_: number, _nodeData: PropertyItemFlatNode) => _nodeData.expandable
//   getLevel = (node: PropertyItemFlatNode) => node.level
//   getChildren = (node: PropertyItemNode): PropertyItemNode[] => node.children
//   isExpandable = (node: PropertyItemFlatNode) => node.expandable
//   treeFlattener: MatTreeFlattener<PropertyItemNode, PropertyItemFlatNode, string> = new MatTreeFlattener(
//     this.transformer,
//     this.getLevel,
//     this.isExpandable,
//     this.getChildren
//   )
//   treeControl = new FlatTreeControl<PropertyItemFlatNode, string>(this.getLevel, this.isExpandable, {
//     trackBy: (dataNode: PropertyItemFlatNode) => dataNode.id
//   })
//   dataSource: MatTreeFlatDataSource<PropertyItemNode, PropertyItemFlatNode, string> = new MatTreeFlatDataSource(
//     this.treeControl,
//     this.treeFlattener
//   )

//   constructor() {
//     this.dataSource.data = []

//     effect(() => {
//       this.update(this.dimension())
//     })
//   }

//   update(dimension: PropertyDimension) {
//     this.dataSource.data = [
//       {
//         ...dimension,
//         id: dimension.__id__,
//         role: AggregationRole.dimension,
//         isUsage: !!this.usage,
//         label: dimension.caption,
//         children: dimension.hierarchies?.map((hierarchy) => {
//           return {
//             ...hierarchy,
//             label: hierarchy.caption,
//             dimension: dimension.name,
//             id: hierarchy.__id__,
//             role: AggregationRole.hierarchy,
//             children: hierarchy.levels?.map((level) => {
//               return {
//                 ...level,
//                 dimension: dimension.name,
//                 hierarchy: hierarchy.name,
//                 id: level.__id__,
//                 role: AggregationRole.level,
//                 label: level.caption,
//                 children: null
//               }
//             })
//           }
//         })
//       } as PropertyItemNode
//     ]
//   }

//   isSelected(node: PropertyAttributes) {
//     if (this.usage) {
//       if (node.role === AggregationRole.dimension) {
//         return this.cubeState.isSelectedProperty(ModelDesignerType.dimensionUsage, this.usage.__id__)
//         // return this.checklistSelection?.isSelected(ModelDesignerType.dimensionUsage + '#' + this.usage.__id__)
//       }
//     } else {
//       return this.cubeState.isSelectedProperty(node.role, node.__id__)
//       // return this.checklistSelection?.isSelected(node.role + '#' + node.id)
//     }
//     return false
//   }

//   onSelect(node: PropertyAttributes) {
//     if (this.usage) {
//       if (node.role === AggregationRole.dimension) {
//         this.cubeState.setSelectedProperty(ModelDesignerType.dimensionUsage, this.usage.__id__)
//         // this.checklistSelection.toggle(`${}#${}`)
//       }
//     } else {
//       // this.checklistSelection.toggle(`${node.role}#${node.__id__}`)
//       this.cubeState.toggleSelectedProperty(node.role, node.__id__)
//     }
//   }

//   addNewItem(event, node: PropertyItemFlatNode) {
//     event.stopPropagation()
//     if (!isNil(node)) {
//       this.treeControl.expand(node)
//       this.newItem.emit({ id: node.id, role: node?.role })
//     }
//   }

//   onDelete(event, node: PropertyItemFlatNode) {
//     event.stopPropagation()
//     if (this.usage) {
//       this.delete.emit(this.usage.__id__)
//     } else {
//       this.delete.emit(node.id)
//     }
//   }
// }
