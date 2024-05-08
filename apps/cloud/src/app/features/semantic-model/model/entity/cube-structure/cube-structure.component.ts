import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChildren,
  booleanAttribute,
  inject,
  input
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { NxActionStripModule } from '@metad/components/action-strip'
import { NgmCommonModule, SplitterType } from '@metad/ocap-angular/common'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import {
  AggregationRole,
  CalculatedMember,
  CalculatedProperty,
  CalculationType,
  DimensionUsage,
  PropertyMeasure,
  isVisible
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { NGXLogger } from 'ngx-logger'
import { map, withLatestFrom } from 'rxjs'
import { SemanticModelService } from '../../model.service'
import { MODEL_TYPE, ModelDesignerType, SemanticModelEntity, SemanticModelEntityType } from '../../types'
import { PropertyDimensionComponent } from '../dimension/dimension.component'
import { ModelEntityService } from '../entity.service'
import { CubeEventType } from '../types'

/**
 * 展示和编辑多维分析模型的字段列表
 *
 * @param @readonly entityType 目标系统中的字段, 只读
 * @param cube 本系统多维分析模型的配置或者对目标系统多维模型的增强信息
 * @returns cube 双向绑定的输出类型
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-cube-structure',
  templateUrl: 'cube-structure.component.html',
  styleUrls: ['cube-structure.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
    NgmCommonModule,

    PropertyDimensionComponent,
    NgmEntityPropertyComponent,
    NxActionStripModule
  ]
})
export class ModelCubeStructureComponent {
  ModelDesignerType = ModelDesignerType
  AGGREGATION_ROLE = AggregationRole
  CALCULATION_TYPE = CalculationType
  SplitterType = SplitterType
  MODEL_TYPE = MODEL_TYPE
  isVisible = isVisible

  private readonly modelService = inject(SemanticModelService)
  public readonly cubeState = inject(ModelEntityService)
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _logger = inject(NGXLogger)

  @Input() modelType: MODEL_TYPE
  readonly editable = input<boolean, boolean | string>(false, {
    transform: booleanAttribute
  })
  // @Output() selectedChange = new EventEmitter<string>()
  @Output() editChange = new EventEmitter<any>()

  @ViewChildren(CdkDropList) cdkDropList: CdkDropList[]

  public readonly dimensionUsages$ = this.cubeState.dimensionUsages$.pipe(
    withLatestFrom(this.modelService.sharedDimensions$),
    map(([dimensionUsages, sharedDimensions]) => {
      return dimensionUsages?.map((usage) => {
        const dimension = sharedDimensions.find((item) => usage.source === item.name)
        return {
          usage,
          dimension: {
            ...(dimension ?? {}),
            name: usage.name,
            caption: usage.caption || dimension?.caption,
            __id__: usage.__id__
          }
        }
      })
    })
  )

  public readonly calculatedMembers = toSignal(
    this.cubeState.calculatedMembers$.pipe(
      map((members) => {
        return members?.map(
          (member) =>
            ({
              ...member,
              role: AggregationRole.measure,
              calculationType: CalculationType.Calculated
            } as Partial<CalculatedMember>)
        )
      })
    )
  )

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly measures$ = toSignal(
    this.cubeState.measures$.pipe(
      map((measures) =>
        measures?.map(
          (measure) =>
            ({
              ...measure,
              role: AggregationRole.measure
            } as PropertyMeasure)
        )
      )
    )
  )

  readonly selectedProperty = this.cubeState.selectedProperty

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  // private _selectedNodeSub = this.checklistSelection.changed.pipe(takeUntilDestroyed()).subscribe((selected) => {
  //   const node: string = selected.added[0]
  //   if (node) {
  //     this.selectedChange.emit(node)
  //   } else {
  //     this.selectedChange.emit(null)
  //   }
  // })
  // 手动 Stop Receiving dropListRef, 因为官方的程序在跨页面 DropList 间似乎 detectChanges 时间先后有问题
  private _dragReleasedSub = this.modelService.dragReleased$.pipe(takeUntilDestroyed()).subscribe((_dropListRef) => {
    this.cdkDropList.forEach((list) => list._dropListRef._stopReceiving(_dropListRef))
    this._cdr.detectChanges()
  })

  trackById(index: number, el: any) {
    return el.name
  }

  emitEvent(event: CubeEventType) {
    this.cubeState.event$.next(event)
  }

  /** Select the category so we can insert the new item. */
  addNewItem({ id, role }: { id?: string; role?: AggregationRole }, node?) {
    if (!id) {
      this.cubeState.newDimension(null)
    } else {
      if (role === AggregationRole.dimension) {
        this.cubeState.newHierarchy({ id, name: '' })
      } else if (role === AggregationRole.hierarchy) {
        this.cubeState.newLevel({ id, name: '' })
      }
    }
  }

  onDelete(id: string) {
    this.cubeState.deleteDimensionProperty(id)
  }

  isSelected(type: ModelDesignerType, key: string) {
    return this.cubeState.isSelectedProperty(type, key)
  }

  onSelect(type: ModelDesignerType, node: Partial<CalculatedMember>) {
    // this.checklistSelection.toggle(`${type}#${node.__id__}`)
    if (type === ModelDesignerType.calculatedMember) {
      this.onCalculatedMemberEdit(node as CalculatedProperty)
    } else {
      this.cubeState.toggleSelectedProperty(type, node.__id__)
    }
  }

  onAddMeasure(event) {
    event.stopPropagation()
    this.cubeState.newMeasure(null)
  }

  onAddCalculatedMember(event) {
    event.stopPropagation()
    this.cubeState.newCalculatedMeasure(null)
  }

  onCalculatedMemberEdit(member: Partial<CalculatedMember>) {
    this.cubeState.setSelectedProperty(ModelDesignerType.calculatedMember, member.__id__)
    // this.checklistSelection.select(`${ModelDesignerType.calculatedMember}#${member.__id__}`)
    this.editChange.emit(member)
  }

  onDeleteCalculatedMember(event, member: Partial<CalculatedMember>) {
    event.stopPropagation()
    this.cubeState.deleteCalculatedMember(member.__id__)
  }

  onDeleteMeasure(event, member: PropertyMeasure) {
    event.stopPropagation()
    this.cubeState.deleteMeasure(member.__id__)
  }

  deleteDimensionUsage(event, member: DimensionUsage) {
    this.cubeState.deleteDimensionUsage(member.__id__)
  }

  toDimensionUsage(member: DimensionUsage) {
    this.cubeState.navigateDimension(member.__id__)
  }

  dropDimensionPredicate(item: CdkDrag<SemanticModelEntity>) {
    // Dimension usage
    return (
      item.data?.type === SemanticModelEntityType.DIMENSION ||
      // Dimension from source table columns
      item.dropContainer.id === 'list-table-measures' ||
      item.dropContainer.id === 'list-table-dimensions' ||
      // db tables
      item.dropContainer.id === 'pac-model-entitysets'
    )
  }

  measureEnterPredicate(item: CdkDrag<SemanticModelEntity>) {
    return item.dropContainer.id === 'list-table-measures' || item.dropContainer.id === 'list-table-dimensions'
  }

  calculatedEnterPredicate(item: CdkDrag<SemanticModelEntity>) {
    return item.dropContainer.id === 'list-table-measures' || item.dropContainer.id === 'list-table-dimensions'
  }

  /**
   * When drop in the dimension list
   */
  dropDimension(event: CdkDragDrop<any[]>) {
    const previousItem = event.item.data
    const index = event.currentIndex
    if (event.previousContainer.id === event.container.id) {
      this.cubeState.moveItemInDimensions(event)
    } else if (event.previousContainer.id === 'list-measures') {
      // 将 Measure 变成 Dimension
      // this.cubeState.moveFromMeasureToDim(previousItem)
    } else if (
      event.previousContainer.id === 'list-table-measures' ||
      event.previousContainer.id === 'list-table-dimensions'
    ) {
      // Insert as a level in hierarchy if it above a level node
      if (event.container.getSortedItems()[event.currentIndex]?.data.role === AggregationRole.level) {
        for (let i = event.currentIndex - 1; i >= 0; i--) {
          const aboveItem = event.container.getSortedItems()[i]
          if (aboveItem?.data.role === AggregationRole.hierarchy) {
            this.cubeState.newLevel({
              id: aboveItem.data.__id__,
              index: index - i - 1,
              name: previousItem.name,
              column: previousItem.name,
              caption: previousItem.caption
            })
            return
          }
        }
      } else {
        // Add as a dimension
        this.cubeState.newDimension({
          index,
          column: previousItem
        })
        this.emitEvent({ type: 'dimension-created' })
      }
    }

    // Add shared dimension into this cube
    if (
      event.previousContainer.id === 'pac-model-entities' &&
      previousItem.type === SemanticModelEntityType.DIMENSION &&
      event.container.id === 'list-dimensions'
    ) {
      this.cubeState.newDimensionUsage({
        index,
        usage: {
          name: previousItem.dimension.name,
          caption: previousItem.dimension.caption,
          source: previousItem.dimension.name,
          foreignKey: previousItem.dimension.foreignKey
        }
      })
      this.emitEvent({ type: 'dimension-created' })
    }

    // Add db table as dimension
    if (event.previousContainer.id === 'pac-model-entitysets') {
      this.cubeState.newDimension({
        index,
        table: previousItem
      })
      this.emitEvent({ type: 'dimension-created' })
    }
  }

  async dropMeasure(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      this.cubeState.moveItemInMeasures(event)
    } else if (
      event.previousContainer.id === 'list-table-measures' ||
      event.previousContainer.id === 'list-table-dimensions'
    ) {
      this.cubeState.newMeasure({ index: event.currentIndex, column: event.item.data.name })
    }
  }

  async dropCalcMembers(event: CdkDragDrop<Partial<CalculatedMember>[]>) {
    if (event.previousContainer === event.container) {
      this.cubeState.moveItemInCalculatedMember(event)
    } else if (
      event.previousContainer.id === 'list-table-measures' ||
      event.previousContainer.id === 'list-table-dimensions'
    ) {
      this.cubeState.newCalculatedMeasure({ index: event.currentIndex, column: event.item.data.name })
    }
  }
}
