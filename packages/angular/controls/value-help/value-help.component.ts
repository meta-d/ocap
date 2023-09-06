import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  computed,
  inject,
  signal
} from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayDensity, NgmAppearance, NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  ISlicer,
  PresentationEnum,
  PropertyHierarchy,
  TreeSelectionMode,
  getEntityProperty
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { merge } from 'lodash-es'
import { filter, map, switchMap } from 'rxjs'
import { NgmMemberListComponent } from '../member-list/member-list.component'
import { NgmMemberTreeComponent } from '../member-tree/member-tree.component'
import { ControlOptions, TreeControlOptions } from '../types'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-value-help',
  templateUrl: 'value-help.component.html',
  styleUrls: ['value-help.component.scss'],
  host: {
    class: 'ngm-value-help'
  },
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatDialogModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    NgmCommonModule,
    OcapCoreModule,
    NgmMemberListComponent,
    NgmMemberTreeComponent
  ]
})
export class NgmValueHelpComponent implements OnInit {
  DISPLAY_BEHAVIOUR = DisplayBehaviour
  FilterSelectionType = FilterSelectionType
  TreeSelectionMode = TreeSelectionMode
  PresentationEnum = PresentationEnum

  private dsCoreService? = inject(NgmDSCoreService, { optional: true })

  @Input() get dataSettings(): DataSettings {
    return this.dataSettings$()
  }
  set dataSettings(value) {
    this.dataSettings$.set(value)
  }
  private dataSettings$ = signal<DataSettings>(null) // new BehaviorSubject<DataSettings>(null)

  @Input() get dimension(): Dimension {
    return this.dimension$()
  }
  set dimension(value) {
    this.dimension$.set(value)
  }
  private dimension$ = signal<Dimension>(null) // new BehaviorSubject<Dimension>(null)

  @Input() options = {
    stickyHeader: true
  } as ControlOptions
  @Input() appearance: NgmAppearance = {
    displayDensity: DisplayDensity.cosy,
    appearance: 'standard' as MatFormFieldAppearance
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

  get showAllMember() {
    return this.options?.showAllMember
  }
  set showAllMember(value) {
    this.options = {
      ...(this.options ?? {}),
      showAllMember: value
    } as ControlOptions
  }

  get onlyLeaves() {
    return (<TreeControlOptions>this.options)?.onlyLeaves
  }
  set onlyLeaves(value) {
    this.options = {
      ...(this.options ?? {}),
      onlyLeaves: value
    } as ControlOptions
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
    return (<TreeControlOptions>this.options)?.treeSelectionMode
  }
  set treeSelectionMode(value) {
    this.options = {
      ...(this.options ?? {}),
      treeSelectionMode: value
    } as ControlOptions
  }

  presentation: PresentationEnum
  expandAvailables = false

  entityType = toSignal(
    toObservable(this.dataSettings$).pipe(
      filter((dataSettings) => !!dataSettings?.dataSource && !!dataSettings?.entitySet),
      switchMap((dataSettings) => this.dsCoreService.selectEntitySet(dataSettings.dataSource, dataSettings.entitySet)),
      map((entitySet) => entitySet?.entityType)
    )
  )

  hierarchies = computed<PropertyHierarchy[]>(() => {
    const entityType = this.entityType()
    const dimension = this.dimension$()
    if (entityType && dimension) {
      const hierarchies = getEntityProperty(entityType, dimension)?.hierarchies
      if (hierarchies?.length) {
        this.presentation = this.presentation ?? PresentationEnum.Hierarchy
      }
      return hierarchies
    }
    return []
  })

  get selectedMembers() {
    return this.slicer?.members
  }

  constructor(
    @Optional() public dialogRef?: MatDialogRef<NgmValueHelpComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      dsCoreService: NgmDSCoreService
      dataSettings: DataSettings
      dimension: Dimension
      options: ControlOptions
      slicer: ISlicer
    }
  ) {
    if (data?.dsCoreService) {
      this.dsCoreService = data.dsCoreService
    }
  }

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
    this.dialogRef.close({
      ...this.slicer,
      dimension: {
        ...this.dimension,
        // Default to descriptionOnly
        displayBehaviour: this.dimension.displayBehaviour ?? DisplayBehaviour.descriptionOnly
      }
    })
  }
}
