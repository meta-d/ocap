import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { DisplayDensity, NgmAppearance, NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  getEntityProperty,
  ISlicer,
  PresentationEnum,
  PropertyHierarchy,
  TreeSelectionMode
} from '@metad/ocap-core'
import merge from 'lodash/merge'
import { BehaviorSubject, combineLatestWith, filter, map, Observable, switchMap, tap } from 'rxjs'
import { MemberTreeOptions } from '../member-tree/member-tree.component'
import { ControlOptions } from '../types'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-value-help',
  templateUrl: 'value-help.component.html',
  styleUrls: ['value-help.component.scss']
})
export class ValueHelpDialog implements OnInit {
  DISPLAY_BEHAVIOUR = DisplayBehaviour
  FilterSelectionType = FilterSelectionType
  TreeSelectionMode = TreeSelectionMode
  PresentationEnum = PresentationEnum

  @Input() get dataSettings(): DataSettings {
    return this.dataSettings$.value
  }
  set dataSettings(value) {
    this.dataSettings$.next(value)
  }
  private dataSettings$ = new BehaviorSubject<DataSettings>(null)

  @Input() get dimension(): Dimension {
    return this.dimension$.value
  }
  set dimension(value) {
    this.dimension$.next(value)
  }
  private dimension$ = new BehaviorSubject<Dimension>(null)

  @Input() options = {
      stickyHeader: true
    } as ControlOptions
  @Input() appearance: NgmAppearance = {
    displayDensity: DisplayDensity.cosy,
    appearance: 'outline'
  }

  slicer: ISlicer = {}

  /**
   * 绑定 Slicer 只取其 members 属性
   */
  get slicerModel() {
    return this.slicer
  }
  set slicerModel(value) {
    this.slicer.members = value.members
  }

  get displayBehaviour() {
    return this.dimension?.displayBehaviour
  }
  set displayBehaviour(value) {
    this.dimension = {
      ...this.dimension,
      displayBehaviour: value
    }
  }

  get hierarchy() {
    return this.dimension?.hierarchy
  }
  set hierarchy(value) {
    this.dimension = {
      ...this.dimension,
      hierarchy: value
    }
  }

  get excludeSelected() {
    return this.slicer.exclude
  }
  set excludeSelected(value) {
    this.slicer = {
      ...this.slicer,
      exclude: value
    }
  }

  get selectionType() {
    return this.options?.selectionType
  }
  set selectionType(value) {
    this.options = {
      ...(this.options ?? {}),
      selectionType: value
    } as ControlOptions
  }

  get treeSelectionMode() {
    return (this.options as MemberTreeOptions)?.treeSelectionMode
  }
  set treeSelectionMode(value) {
    this.options = {
      ...(this.options ?? {}),
      treeSelectionMode: value
    } as ControlOptions
  }

  presentation: PresentationEnum
  expandAvailables = false
  
  readonly hierarchies$: Observable<Array<PropertyHierarchy>> = this.dataSettings$.pipe(
    filter((dataSettings) => !!dataSettings?.dataSource && !!dataSettings?.entitySet),
    switchMap((dataSettings) => this.dsCoreService.getEntitySet(dataSettings.dataSource, dataSettings.entitySet)),
    combineLatestWith(this.dimension$.pipe(filter((dim) => !!dim))),
    map(([entitySet, dimension]) => {
      const property = getEntityProperty(entitySet.entityType, dimension)
      return property.hierarchies
    }),
    tap((hierarchies) => {
      if (hierarchies?.length) {
        this.presentation = this.presentation ?? PresentationEnum.Hierarchy
      }
    })
  )

  get selectedMembers() {
    return this.slicer?.members
  }
  constructor(
    private dsCoreService: NgmDSCoreService,
    @Optional() public dialogRef?: MatDialogRef<ValueHelpDialog>,
    @Optional() @Inject(MAT_DIALOG_DATA)
    public data?: {
      dataSettings: DataSettings
      dimension: Dimension
      options: ControlOptions
      slicer: ISlicer
    },
  ) {}

  ngOnInit() {
    if (this.data) {
      this.dataSettings = this.data.dataSettings
      this.dimension = this.data.dimension
      if (this.data.options) {
        this.options = merge(this.options, this.data.options)
      }
      this.slicer = {
        ...(this.data.slicer ?? {})
      }
    }
  }

  deleteMember(i) {
    const members = [...this.slicer.members]
    members.splice(i, 1)
    this.slicer = {
      ...this.slicer,
      members
    }
  }

  clearSelection() {
    this.slicer = {
      ...this.slicer,
      members: []
    }
  }

  close() {
    this.dialogRef.close({...this.slicer, dimension: {...this.dimension}})
  }
}
