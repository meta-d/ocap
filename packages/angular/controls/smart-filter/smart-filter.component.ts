import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling'
import { FlatTreeControl } from '@angular/cdk/tree'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  computed,
  effect,
  forwardRef,
  inject,
  signal
} from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayDensity, ISelectOption, NgmAppearance, OcapCoreModule } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  FlatTreeNode,
  IDimensionMember,
  IMember,
  ISlicer,
  TreeNodeInterface,
  filterTreeNodes,
  getEntityProperty
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  of,
  startWith
} from 'rxjs'
import { NgmSmartFilterService } from '../smart-filter.service'
import { ControlOptions } from '../types'
import { NgmValueHelpComponent } from '../value-help/value-help.component'
import { MatRadioModule } from '@angular/material/radio'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'

export interface SmartFilterOptions extends ControlOptions {
  maxTagCount?: number
  autoActiveFirst?: boolean
  initialLevel?: number
}

export interface SmartFilterState {
  options: SmartFilterOptions
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-smart-filter',
  templateUrl: 'smart-filter.component.html',
  styleUrls: ['smart-filter.component.scss'],
  host: {
    class: 'ngm-smart-filter'
  },
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmSmartFilterComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatRadioModule,
    MatCheckboxModule,
    ScrollingModule,
    OcapCoreModule,
    NgmCommonModule,
    NgmEntityPropertyComponent
  ]
})
export class NgmSmartFilterComponent implements ControlValueAccessor {
  private smartFilterService = inject(NgmSmartFilterService)
  private _dialog = inject(MatDialog)
  private _viewContainerRef = inject(ViewContainerRef)

  private _dataSettings = signal<DataSettings>(null)
  @Input() get dataSettings(): DataSettings {
    return this._dataSettings()
  }
  set dataSettings(value: DataSettings) {
    this._dataSettings.set(value)
  }

  private _dimension = signal<Dimension>(null)
  @Input() get dimension(): Dimension {
    return this._dimension()
  }
  set dimension(value: Dimension) {
    this._dimension.set(value)
  }

  private _options = signal<SmartFilterOptions>(null)
  @Input() get options() {
    return this._options()
  }
  set options(value) {
    this._options.set(value)
  }

  get slicer() {
    return this.slicer$.value
  }
  set slicer(value) {
    this.slicer$.next(value)
  }
  public readonly slicer$ = new BehaviorSubject<ISlicer>({})

  public members = signal<IMember[]>(null)

  private _appearance = signal<NgmAppearance>(null)
  @Input() get appearance(): NgmAppearance {
    return this._appearance()
  }
  set appearance(value: NgmAppearance) {
    this._appearance.set(value)
  }

  @Input() displayDensity: string

  @Input()
  get disabled(): boolean {
    return this.disabled$()
  }
  set disabled(value: boolean | string) {
    this.disabled$.set(coerceBooleanProperty(value))
  }
  private disabled$ = signal<boolean>(false)

  @Output() loadingChanging = new EventEmitter<boolean>()

  @ViewChild(CdkVirtualScrollViewport, { static: false })
  cdkVirtualScrollViewPort: CdkVirtualScrollViewport

  get multiple() {
    return this.options?.multiple
  }

  get hierarchy() {
    return this.dimension?.hierarchy ?? this.dimension?.dimension
  }
  set hierarchy(value) {
    this.dimension = {
      ...this.dimension,
      hierarchy: value,
      level: null
    }
  }

  get displayBehaviour() {
    return this.dimension?.displayBehaviour ?? DisplayBehaviour.descriptionOnly
  }
  get searchHighlight() {
    return this.valueControl.value
  }

  virtualScrollItemSize = 48
  treeNodePaddingIndent = 20
  private transformer = (node: TreeNodeInterface<any>, level: number): FlatTreeNode<any> => {
    return {
      expandable: !!node.children && node.children.length > 0,
      key: node.key,
      caption: node.caption,
      value: node.value,
      level: level,
      childrenCardinality: node.children?.length,
      raw: node.raw
    }
  }
  treeControl = new FlatTreeControl<FlatTreeNode<any>>(
    (node) => node.level,
    (node) => node.expandable
  )
  private treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  )
  private dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
  public readonly selectOptions$ = this.dataSource.connect({ viewChange: of() })

  private readonly entityType = toSignal(this.smartFilterService.selectEntityType())
  public readonly options$ = toObservable(this._options)

  public readonly property = computed(() => getEntityProperty(this.entityType(), this.dimension))
  public readonly hierarchies = computed(() => this.property()?.hierarchies)
  public readonly label = computed(() => this.options?.label || this.property()?.caption || this.property()?.name)

  public readonly placeholder$ = this.options$.pipe(map((options) => options?.placeholder))
  public readonly selectionType$ = this.options$.pipe(map((options) => options?.selectionType))
  public readonly multiple$ = this.selectionType$.pipe(
    map((selectionType) => selectionType === FilterSelectionType.Multiple)
  )
  // public readonly maxTagCount$ = this.options$.pipe(map((options) => options?.maxTagCount ?? 1))
  public readonly maxTagCount = computed(() => this.options?.maxTagCount ?? 1)
  public readonly autoActiveFirst$ = this.options$.pipe(map((options) => options?.autoActiveFirst))

  public readonly members$ = combineLatest([
    this.slicer$.pipe(map((slicer) => slicer?.members)),
    this.smartFilterService.selectOptions$
  ]).pipe(
    map(([members, selectOptions]) => {
      return members?.map(({ value, caption }) => ({
        value,
        caption: selectOptions?.find((item) => item.value === value)?.caption ?? caption
      }))
    })
  )

  public readonly loading$ = this.smartFilterService.loading$

  // 输入框 tags
  public readonly membersSignal = toSignal(this.members$)
  public readonly isNotInitial = computed(() => !!this.membersSignal()?.length)
  public restChips = signal<string[]>([])
  public readonly chips$ = this.members$.pipe(
    map((selectedMembers) => {
      const _chips = selectedMembers ? [...selectedMembers] : []
      this.restChips.set(this.maxTagCount() ? _chips.splice(this.maxTagCount()).map(({ caption }) => caption) : [])
      return _chips as Array<ISelectOption<string>>
    })
  )

  // Tree
  public readonly membersTree$ = this.smartFilterService.membersTree$

  valueControl = new FormControl()
  selectable = true
  removable = true
  addOnBlur = true

  // 用户输入条件过滤出的选择列表
  public readonly filteredOptions$ = this.valueControl.valueChanges.pipe(
    map((text) => (text ? `${text}`.toLowerCase() : text)),
    startWith(null),
    combineLatestWith(this.selectOptions$),
    map(
      ([text, selectOptions]) =>
        (text
          ? selectOptions?.filter(
              (option) => option.caption?.toLowerCase().includes(text) || `${option.value}`.toLowerCase().includes(text)
            )
          : selectOptions) ?? []
    )
  )
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]

  @ViewChild('search') searchInput: ElementRef<HTMLInputElement>

  onChange: (input: ISlicer) => any

  private loadingSub = this.smartFilterService.loading$.pipe(takeUntilDestroyed()).subscribe((loading) => {
    this.loadingChanging.emit(loading)
  })
  private serviceSub = this.smartFilterService
    .onAfterServiceInit()
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.smartFilterService.refresh()
    })
  private slicerSub = this.slicer$.pipe(takeUntilDestroyed()).subscribe((slicer) => {
    slicer.dimension = {
      ...this.dimension
    }
    this.onChange?.(slicer)
  })

  // Update tree dataSource data when select options and search text changed
  private _treeNodesSub = this.membersTree$
    .pipe(
      combineLatestWith(
        this.valueControl.valueChanges.pipe(
          filter((value) => !value || typeof value === 'string'),
          startWith(null),
          distinctUntilChanged()
        )
      ),
      map(([treeNodes, text]) => {
        return filterTreeNodes(treeNodes ?? [], text, {
          considerKey: this.displayBehaviour !== DisplayBehaviour.descriptionOnly
        })
      })
    )
    .subscribe((nodes) => {
      this.dataSource.data = nodes
      if (this.options?.initialLevel || !!this.valueControl.value) {
        this.treeControl.dataNodes.forEach((node) => {
          const level = this.treeControl.getLevel(node)
          // is in initial levels or the searched node is exacted
          if (level < this.options.initialLevel || (this.valueControl.value && node.childrenCardinality === 1)) {
            this.treeControl.expand(node)
          }
        })
      }
    })

  constructor() {
    // 由于 set dataSettings 会同步执行至 toSignal entityType，所以需要使用 allowSignalWrites 设置
    effect(
      () => {
        if (this.dataSettings) {
          this.smartFilterService.dataSettings = this.dataSettings
        }
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      this.smartFilterService.options = {
        ...(this.options ?? {}),
        dimension: this.dimension
      }
    })

    effect(() => {
      if (this.options?.defaultMembers) {
        this.slicer = {
          ...this.slicer,
          members: [...this.options.defaultMembers]
        }
      }
    })

    effect(() => {
      if (this.displayDensity) {
        if (this.displayDensity === DisplayDensity.compact) {
          this.treeNodePaddingIndent = 10
          this.virtualScrollItemSize = 30
        } else if (this.displayDensity === DisplayDensity.cosy) {
          this.treeNodePaddingIndent = 15
          this.virtualScrollItemSize = 36
        } else {
          this.treeNodePaddingIndent = 20
          this.virtualScrollItemSize = 48
        }
      }
    })

    effect(() => {
      if (this.disabled) {
        this.valueControl.disable()
      } else {
        this.valueControl.enable()
      }
    })
  }

  writeValue(obj: any): void {
    if (obj) {
      this.slicer = obj
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
    if (isDisabled) {
      this.valueControl.disable()
    } else {
      this.valueControl.enable()
    }
  }

  trackBy(index: number, item: IMember) {
    return item.value
  }
  trackByKey(index: number, item: FlatTreeNode<any>) {
    return item.key
  }
  trackByName(index, item) {
    return item?.name
  }

  displayWithCaption(member: FlatTreeNode<unknown>) {
    return member?.caption || member?.key
  }

  isSelected(option: FlatTreeNode<unknown>) {
    return this.slicer.members?.some((member) => member.value === option.key)
  }

  onCheckboxChange(event: MatCheckboxChange, option: FlatTreeNode<any>) {
    if (event.checked) {
      this.toggleMember({
        value: option.key,
        caption: option.caption
      })
    } else {
      this.removeMember({
        value: option.key,
        caption: option.caption
      })
    }
  }

  removeMember({ value }: IMember) {
    this.slicer = {
      ...this.slicer,
      members: this.slicer.members.filter((member) => member.value !== value)
    }
  }

  clearMembers() {
    this.slicer = {
      ...this.slicer,
      members: []
    }
  }

  selectMember(event: MatAutocompleteSelectedEvent) {
    const memberFlatNode = event.option.value as FlatTreeNode<IDimensionMember>
    this.toggleMember({
      value: memberFlatNode.key,
      caption: memberFlatNode.caption
    })
    this.searchInput.nativeElement.value = ''
    this.valueControl.setValue(null)
    this.searchInput.nativeElement.blur()
  }

  onMemberSelect({ event, member }: { event: MatCheckboxChange; member: IMember }) {
    let members = this.slicer.members ?? []

    if (event.checked) {
      if (this.options?.multiple || this.options?.selectionType === FilterSelectionType.Multiple) {
        const index = members.findIndex((item) => item.value === member.value)
        if (index > -1) {
          members.splice(index, 1)
        }
        members.push({
          value: member.value,
          label: member.caption
        })
      } else {
        members = [
          {
            value: member.value,
            label: member.caption
          }
        ]
      }
    } else {
      const index = members.findIndex((item) => item.value === member.value)
      if (index > -1) {
        members.splice(index, 1)
      }
    }

    this.slicer = {
      ...this.slicer,
      members
    }
  }

  toggleMember(member: IMember) {
    let members = this.slicer.members ? [...this.slicer.members] : []
    if (this.options?.multiple || this.options?.selectionType === FilterSelectionType.Multiple) {
      const index = members.findIndex((item) => item.value === member.value)
      if (index > -1) {
        members.splice(index, 1)
      } else {
        members.push({
          value: member.value,
          label: member.caption
        })
      }
    } else {
      members = [
        {
          value: member.value,
          label: member.caption
        }
      ]
    }

    this.slicer = {
      ...this.slicer,
      members
    }
  }

  async openValueHelp(event) {
    const slicer = await firstValueFrom(
      this._dialog
        .open(NgmValueHelpComponent, {
          viewContainerRef: this._viewContainerRef,
          data: {
            dataSettings: this.dataSettings,
            dimension: this.dimension,
            options: {
              ...(this.options ?? {}),
              selectionType:
                this.options?.selectionType ?? (this.options?.multiple ? FilterSelectionType.Multiple : null),
              searchable: true,
              initialLevel: 1
            },
            slicer: this.slicer
          }
        })
        .afterClosed()
    )

    if (slicer) {
      this.dimension = {
        ...this.dimension,
        hierarchy: slicer.dimension.hierarchy,
        displayBehaviour: slicer.dimension.displayBehaviour
      }
      this.slicer = {
        ...this.slicer,
        members: slicer.members ?? [],
        exclude: slicer.exclude
      }
    }
  }

  onAutocompleteOpened() {
    this.cdkVirtualScrollViewPort?.checkViewportSize()
  }
}
