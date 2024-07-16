import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, EventEmitter, forwardRef, HostBinding, inject, input, Output, signal, ViewChild, ViewContainerRef } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import {
  AggregationRole,
  CalculationProperty,
  CalculationType,
  C_MEASURES,
  DataSettings,
  Dimension,
  DisplayBehaviour,
  EntityType,
  FilterSelectionType,
  getEntityProperty,
  getEntityProperty2,
  isCalculationProperty,
  isIndicatorMeasureProperty,
  isMeasure,
  isMeasureControlProperty,
  isParameterProperty,
  isVisible,
  LevelProperty,
  Measure,
  Member,
  omit,
  OrderDirection,
  Property,
  PropertyHierarchy,
  Syntax,
  ParameterControlEnum,
  ParameterProperty,
  PropertyDimension,
  IntrinsicMemberProperties,
  isEntitySet,
  getEntityHierarchy,
  isPropertyMeasure,
  isPropertyDimension,
  PropertyMeasure,
  isVariableProperty,
} from '@metad/ocap-core'
import { cloneDeep, includes, isEmpty, isEqual, isNil, isString, negate, pick, uniq } from 'lodash-es'
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay, startWith, combineLatestWith, debounceTime, pairwise, switchMap } from 'rxjs/operators'
import { MatSelect, MatSelectModule } from '@angular/material/select'
import { getEntityMeasures, PropertyAttributes } from '@metad/ocap-core'
import { DisplayDensity, NgmDSCoreService, NgmOcapCoreService } from '@metad/ocap-angular/core'
import { ControlOptions, NgmValueHelpComponent } from '@metad/ocap-angular/controls'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CommonModule } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { MatDividerModule } from '@angular/material/divider'
import { MatListModule } from '@angular/material/list'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatBadgeModule } from '@angular/material/badge'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { NgmParameterCreateComponent } from '@metad/ocap-angular/parameter'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { PropertyCapacity } from '../types'
import { NgmEntityPropertyComponent, propertyIcon } from '../property/property.component'
import { NgmFormattingComponent } from '../formatting/formatting.component'



@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-property-select',
  templateUrl: './property-select.component.html',
  styleUrls: ['./property-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmPropertySelectComponent),
    },
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    MatDividerModule,
    MatListModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    TranslateModule,
    NgmCommonModule,
    NgmEntityPropertyComponent
  ]
})
export class NgmPropertySelectComponent implements ControlValueAccessor, AfterViewInit {
  AggregationRole = AggregationRole
  DISPLAY_BEHAVIOUR = DisplayBehaviour
  DisplayDensity = DisplayDensity
  CalculationType = CalculationType

  @HostBinding('class.ngm-property-select') isPropertySelect = true

  readonly _dialog? = inject(MatDialog, {optional: true})
  readonly _viewContainerRef = inject(ViewContainerRef, {skipSelf: true})
  readonly _destroyRef = inject(DestroyRef)
  readonly #translate = inject(TranslateService)
  readonly coreService = inject(NgmOcapCoreService)

  readonly DISPLAY_BEHAVIOUR_LIST = [
    {
      value: null,
      label: 'Auto',
    },
    {
      value: 'descriptionAndId',
      label: 'Description and ID',
    },
    {
      value: 'descriptionOnly',
      label: 'Description Only',
    },
    {
      value: 'idOnly',
      label: 'ID Only',
    },
  ]

  /**
  |--------------------------------------------------------------------------
  | Inputs and Outputs
  |--------------------------------------------------------------------------
  */
  readonly label = input<string>()
  // readonly value = signal<Dimension | Measure>(null)
  readonly capacities = input<PropertyCapacity[]>()

  readonly required = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly editable = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly showAttributes = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly dataSettings = input<DataSettings>()
  readonly dataSettings$ = toObservable(this.dataSettings)

  readonly entityType = input<EntityType>()
  
  readonly restrictedDimensions = input<string[]>()
  readonly restrictedDimensions$ = toObservable(this.restrictedDimensions)

  readonly dsCoreService = input<NgmDSCoreService>()

  readonly syntax = input<Syntax>()
  readonly disabled = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly displayDensity = input<DisplayDensity | string>(null)

  @Output() valueChange = new EventEmitter()
  @Output() calculationChange = new EventEmitter()

  @ViewChild('propertySelect', { read: MatSelect })
  private _propertySelect: MatSelect

  readonly formGroup = new FormGroup({
    name: new FormControl<string>(null),
    caption: new FormControl<string>(null),
    dimension: new FormControl<string>(null),
    hierarchy: new FormControl<string>(null),
    level: new FormControl<string>(null),
    exclude: new FormControl<boolean>(null),
    members: new FormControl<Member[]>(null),
    measure: new FormControl<string>(null),
    properties: new FormControl(),
    memberCaption: new FormControl<string>(null),
    displayBehaviour: new FormControl<DisplayBehaviour>(null),
    displayHierarchy: new FormControl<boolean>(null),
    unbookedData: new FormControl<boolean>(null),
    zeroSuppression: new FormControl<boolean>(true),
    formatting: new FormControl(),
    parameter: new FormControl(),
    order: new FormControl<OrderDirection>(null),
  })
  // 初始值
  private readonly _formValue = this.formGroup.value
  searchControl = new FormControl<string>(null)
  get search() {
    return this.searchControl.value
  }
  readonly _disabled = signal(false)
  #value: Dimension | Measure = null

  readonly #dataSettings = computed(() => ({
    dataSource: this.dataSettings()?.dataSource,
    entitySet: this.dataSettings()?.entitySet,
  }), { equal: isEqual })

  readonly entityTypeLoading = signal(false)
  readonly entityTypeError = signal<string>('')
  readonly #entityType = toSignal(this.dataSettings$.pipe(
    map((dataSettings) => ({
      dataSource: dataSettings?.dataSource,
      entitySet: dataSettings?.entitySet,
    })),
    distinctUntilChanged(isEqual),
    switchMap((dataSettings) => {
      if (dataSettings.dataSource && dataSettings.entitySet && this.dsCoreService()) {
        this.entityTypeError.set('')
        this.entityTypeLoading.set(true)
        return this.dsCoreService().getDataSource(dataSettings.dataSource).pipe(
          switchMap((dataSource) => dataSource.selectEntitySet(dataSettings.entitySet)),
          map((entitySet) => {
            this.entityTypeLoading.set(false)
            if (!isEntitySet(entitySet)) {
              this.entityTypeError.set(entitySet.message)
              return null
            }
            return entitySet.entityType
          })
        )
      }
      return of(null)
    }),
  ))

  readonly _entityType = computed(() => this.entityType() ?? this.#entityType())
  readonly entityType$ = toObservable(this._entityType)

  /**
   * 包含 parameters 字段们
   */
  readonly entityProperties$: Observable<Array<PropertyAttributes>> = this.entityType$.pipe(
    filter(negate(isNil)),
    map((entityType: EntityType) => {
      const properties: Array<PropertyAttributes> = Object.values(entityType.properties)
      if (this.capacities()?.includes(PropertyCapacity.MeasureGroup)) {
        const caption = this.getTranslation('Ngm.Property.MeasureGroup', {Default: 'Measure Group'})
        properties.push({
          name: C_MEASURES,
          caption,
          role: AggregationRole.dimension,
        })
      }

      properties.push(...Object.values(entityType.parameters || {}))

      return properties
    }),
    shareReplay(1)
  )

  readonly entityProperties = toSignal(this.entityProperties$)

  readonly parameters$ = this.entityType$.pipe(
    map(entityType => Object.values(entityType?.parameters || {}))
  )

  readonly dimensions$: Observable<Array<Property>> = combineLatest([
    this.entityProperties$,
    this.restrictedDimensions$.pipe(distinctUntilChanged()),
    this.searchControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([properties, restrictedDimensions, text]) => filterProperty(
      properties.filter(item =>
        item.role === AggregationRole.dimension && 
          (isEmpty(restrictedDimensions) ? true : includes(restrictedDimensions, item.name))
          && isVisible(item)
        ),
        text
      )
    ),
    shareReplay(1)
  )

  readonly property$ = new BehaviorSubject<Property>(null)
  readonly property = toSignal(this.property$)

  readonly hierarchies$: Observable<Array<PropertyHierarchy>> = this.property$.pipe(
    map((dimension) => dimension?.hierarchies),
    shareReplay(1)
  )

  readonly hierarchy$ = combineLatest([
    this.hierarchies$,
    this.hierarchyControl.valueChanges.pipe(startWith(null))
  ]).pipe(
    map(([properties, hierarchy]) => properties?.find((prop) => hierarchy ? prop.name === hierarchy : prop.name === prop.dimension)),
    shareReplay(1)
  )

  readonly levels$ = this.hierarchy$.pipe(
    map((hierarchy: PropertyHierarchy) => hierarchy?.levels),
    shareReplay(1)
  )

  readonly level$ = combineLatest([
      this.levels$,
      this.formGroup.get('level').valueChanges
    ]).pipe(
      map(([properties, level]) => properties?.find((prop) => prop.name === level))
    )
  readonly properties$ = this.level$.pipe(map(level => {
    // MDX 固有属性, 移到 entityType dimension 上 ?
    const options = [{
      name: IntrinsicMemberProperties.DESCRIPTION,
      caption: 'DESCRIPTION'
    } as LevelProperty]
    options.push(
      ...(
        level?.properties ?? []
      )
    )
    return options
  }))
  
  readonly labels$ = this.properties$.pipe(map(properties => {
    return properties?.length ? properties : null
  }))
  
  readonly measures$ = this.entityType$.pipe(
    filter(negate(isNil)), map(getEntityMeasures),
    map((measures) => measures.filter((property) => isNil(property.visible) || property.visible)),
    combineLatestWith(this.searchControl.valueChanges.pipe(startWith(''))),
    map(([measures, text]) => filterProperty(measures, text)),
  )
  readonly notCalculations$ = this.measures$.pipe(map((measures) => measures.filter(negate(isCalculationProperty))))
  /**
   * Calculation measures exclude indicator measure
   */
  readonly measures = toSignal(this.measures$, { initialValue: [] })
  readonly calculations = computed(() => this.measures().filter((property => isCalculationProperty(property) && negate(isIndicatorMeasureProperty)(property))))
  readonly measureControls = computed(() => this.calculations().filter(isMeasureControlProperty))
  readonly isMeasure$ = this.property$.pipe(map((property) => property?.role === AggregationRole.measure || property?.name === C_MEASURES))
  readonly isMeasure = computed(() => this.property()?.role === AggregationRole.measure || this.property()?.name === C_MEASURES)
  /**
   * Calculation property exclude indicator measure property
   */
  readonly calculationProperty = computed(() => {
    const property = this.property()
    if (isCalculationProperty(property) && !isIndicatorMeasureProperty(property)) {
      return property
    }
    return null
  })
  readonly isParameter = computed(() => isParameterProperty(this.property()))
  readonly isVariable = computed(() => isVariableProperty(this.property()))
  readonly isDimension = computed(() => this.property()?.role === AggregationRole.dimension)
  readonly showDisplayAs = computed(() => this.isDimension() || this.isVariable() || this.isParameter() && (<ParameterProperty>this.property()).paramType === ParameterControlEnum.Dimensions)

  readonly indicators$ = this.measures$.pipe(map(calculations => calculations?.filter(isIndicatorMeasureProperty) || []))

  private readonly _members = toSignal(this.formGroup.get('members').valueChanges.pipe(startWith([])))
  public readonly membersSignal = computed(() => this.isMeasure() ? getEntityMeasures(this.entityType()).map((property) => ({
    ...property,
    selected: this._members()?.some((member) => member === property.name)
  })) : null )

  // readonly members$: Observable<Array<Property>> = this.measures$.pipe(
  //   switchMap((properties) => {
  //     return combineLatest([
  //       this.property$.pipe(
  //         map((dimension) => {
  //           if (dimension?.name === C_MEASURES) {
  //             return properties
  //               .filter((property) => property.role === AggregationRole.measure)
  //               .map((item) => ({ ...item }))
  //           }
  //           return null
  //         })
  //       ),
  //       // startWith 解决: 在 ngOnInit 初始化 formGroup, 但 template 订阅不到初始值 or 在 ngAfterViewInit 初始化 formGroup 但会报初始化完成后表达式又变化的检查错误
  //       this.formGroup.get('members').valueChanges.pipe(startWith(this.members)),
  //     ]).pipe(
  //       map(([properties, members]: [any, any]) => {
  //         properties?.forEach(
  //           (item) => (item.selected = !!members?.find((member) => member === item.name))
  //         )
  //         return properties
  //       })
  //     )
  //   }),
  //   takeUntilDestroyed(),
  //   shareReplay(1)
  // )

  readonly label$ = combineLatest([this.entityType$, this.formGroup.valueChanges])
    .pipe(
      map(([entityType, dimension]) => {
        if (isMeasure(dimension)) {
          return {
            icon: 'straighten',
            label: !dimension.measure ? 'Measure Group' : 'Measure'
          }
        }

        const {icon, label} = propertyIcon(getEntityProperty2(entityType, dimension))
        return (icon || label) ? {icon, label} : dimension.measure ? propertyIcon(getEntityProperty(entityType, dimension.measure)) : {
          icon,
          label
        }
      })
    )

  private readonly selectTrigger$ = combineLatest([
    this.property$.pipe(startWith(null)),
    this.hierarchy$.pipe(startWith(null)),
    this.level$.pipe(startWith(null)),
    this.formGroup.get('members').valueChanges.pipe(startWith([])),
    this.formGroup.get('exclude').valueChanges.pipe(startWith(null)),
    this.formGroup.get('parameter').valueChanges.pipe(startWith(null)),
    this.formGroup.get('caption').valueChanges.pipe(startWith(null)),

  ]).pipe(
    map(([dimension, hierarchy, level, members, exclude, parameter, caption]) => {
      let property = level ?? hierarchy ?? dimension ?? {} as Property
      property = {...property}
      const dimLabel = hierarchy?.caption || dimension?.caption || dimension?.name
      property.caption = (dimLabel ?? '') + (level?.caption ? '/' + level.caption : (level?.name ? '/'+ level.name : ''))

      if (caption) {
        property.caption = caption
      }

      if (parameter) {
        property.caption += `@${parameter}`
      }

      if (members?.length) {
        property.caption = `${property.caption}:${exclude?' - ':''}${isString(members[0]) ? members[0] : members[0].caption || members[0].key}`
        if (members.length > 1) {
          property.caption += `(+${members.length - 1})`  
        }
      }
      return property
    })
  )

  public readonly selectTrigger = toSignal(this.selectTrigger$)

  get caption() {
    return this.formGroup.get('caption').value
  }
  set caption(value) {
    this.formGroup.patchValue({
      caption: value,
    })
  }
  get dimensionControl() {
    return this.formGroup.get('dimension')
  }
  readonly dimension = toSignal(this.dimensionControl.valueChanges.pipe(startWith(null)))

  get hierarchyControl() {
    return this.formGroup.get('hierarchy')
  }
  get hierarchy() {
    return this.hierarchyControl.value
  }
  set hierarchy(value) {
    this.formGroup.patchValue({
      hierarchy: value,
    })
  }

  get level() {
    return this.formGroup.value.level
  }
  set level(value) {
    this.formGroup.patchValue({
      level: value,
    })
  }

  get exclude() {
    return this.formGroup.value.exclude
  }
  set exclude(exclude: boolean) {
    this.formGroup.patchValue({
      exclude
    })
  }

  get members() {
    return this.formGroup.value.members
  }
  set members(value) {
    this.formGroup.patchValue({
      members: value,
    })
  }

  get properties() {
    return this.formGroup.value.properties
  }
  set properties(value) {
    this.formGroup.patchValue({
      properties: value,
    })
  }

  get memberCaption() {
    return this.formGroup.value.memberCaption
  }
  set memberCaption(memberCaption: string) {
    this.formGroup.patchValue({
      memberCaption
    })
  }

  get displayHierarchy() {
    return this.formGroup.value.displayHierarchy
  }
  set displayHierarchy(value) {
    this.formGroup.patchValue({
      displayHierarchy: value,
    })
  }

  get displayBehaviour() {
    return this.formGroup.value.displayBehaviour
  }
  set displayBehaviour(value) {
    this.formGroup.patchValue({
      displayBehaviour: value,
    })
  }

  get unbookedData() {
    return this.formGroup.value.unbookedData
  }
  set unbookedData(value) {
    this.formGroup.patchValue({
      unbookedData: value,
    })
  }

  get zeroSuppression() {
    return this.formGroup.value.zeroSuppression
  }
  set zeroSuppression(value) {
    this.formGroup.patchValue({
      zeroSuppression: value,
    })
  }

  get parameter() {
    return this.formGroup.value.parameter
  }
  set parameter(value) {
    this.formGroup.patchValue({
      parameter: value
    })
  }

  get order() {
    return this.formGroup.value.order
  }
  set order(value) {
    this.formGroup.patchValue({
      order: value
    })
  }

  get showDimension() {
    return this.capacities()?.includes(PropertyCapacity.Dimension)
  }
  get showMeasure() {
    return this.capacities()?.includes(PropertyCapacity.Measure)
  }
  get showParameter() {
    return this.capacities()?.includes(PropertyCapacity.Parameter)
  }
  get showMeasureControl() {
    return this.capacities()?.includes(PropertyCapacity.MeasureControl)
  }
  get showMeasureAttributes() {
    return this.capacities()?.includes(PropertyCapacity.MeasureAttributes)
  }
  get showOrder() {
    return this.capacities()?.includes(PropertyCapacity.Order)
  }

  readonly showMore = signal(false)

  private onChange: any
  private onTouched: any

  readonly dimensionError = signal<string>('')

  readonly error = computed(() => {
    return this.dimensionError() || this.entityTypeError()
  })

  readonly #dimensionEffect = effect(() => {
    const dimension = this.dimension()
    const properties = this.entityProperties()
    if (dimension && properties) {
      const property = properties.find((prop) => prop.name === dimension)
      if (property) {
        this.property$.next(property)
        this.dimensionError.set('')
      } else {
        const entityType = this._entityType()
        this.dimensionError.set(this.getTranslation('Ngm.Property.DimensionNotFound', {
          dimension,
          cube: entityType?.name || 'unknown',
          Default: `Dimension '${dimension}' not found in cube '${entityType?.name}'`
        }))
      }
    }
  }, { allowSignalWrites: true })
    
  /**
   * When dimension changed
   */
  private dimensionSub = this.dimensionControl.valueChanges.pipe(distinctUntilChanged(), pairwise(), takeUntilDestroyed())
    .subscribe(([,dimension]) => {
      const property = getEntityProperty<PropertyDimension | PropertyMeasure>(this.entityType(), dimension)
      if (isPropertyMeasure(property)) {
        this.formGroup.setValue({
          ...this._formValue,
          dimension,
        } as any)
      } else if(isPropertyDimension(property)) {
        const hierarchyName = property.defaultHierarchy || dimension
        let hierarchyProperty = getEntityHierarchy(this.entityType(), { dimension, hierarchy: hierarchyName})
        if (!hierarchyProperty) {
          hierarchyProperty = property.hierarchies[0]
        }
        // Reset all fields and set default hierarchy
        this.formGroup.setValue({
          ...this._formValue,
          dimension,
          hierarchy: hierarchyProperty?.name
        } as any)
      }
    })
  private hierarchySub = this.hierarchyControl.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
    .subscribe(() => {
      this.formGroup.patchValue({
        level: null,
      })
    })

  constructor() {
    effect(() => {
      if (!isNil(this.disabled())) {
        this._disabled.set(this.disabled())
      }
    }, { allowSignalWrites: true })

    // effect(() => console.log(this._entityType(), this.measures()))
  }

  writeValue(obj: any): void {
    this.#value = obj ?? {}
    // 避免双向绑定的循环更新
    if (obj && !isEqual(this.#value, this.formGroup.value)) {
      this.patchValue(this.#value)
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this._disabled.set(isDisabled)
  }

  ngAfterViewInit(): void {
    /**
     * ngOnInit 后 template 完成各订阅后再发送初始值, 不记得什么情况下会报 "ExpressionChangedAfterItHasBeenCheckedError" 的错误
     * writeValue 双向绑定初始值是在 template 订阅之前, 所以初始值要放在 ngAfterViewInit
     */
    this.patchValue(this.#value)

    // subscribe formGroup to export value
    this.formGroup.valueChanges.pipe(
      debounceTime(100),
      // Update value when property is initialized
      filter(() => !!this.property$.value),
      takeUntilDestroyed(this._destroyRef),
    ).subscribe((value) => {
      if (this.property$.value?.role === AggregationRole.measure) {
        value = {
          ...value,
          dimension: C_MEASURES,
          measure: value.dimension
        } as Dimension
      } else {
        value = {
          ...value,
          hierarchy: value.hierarchy ?? value.dimension
        }
      }

      this.valueChange.emit(value)
      this.onChange?.(value)
    })
  }

  patchValue(value) {
    if (isString(value)) {
      this.formGroup.patchValue({
        dimension: value,
      })
    } else if(isMeasure(value)) {
      if (value.measure) {
        // 借用 dimension 属性表达 measure property
        // Firstly, trigger dimension value init
        this.formGroup.patchValue({
          dimension: value.measure,
        })
        // Then, patch measure properties
        this.formGroup.patchValue({
          ...value,
          dimension: value.measure
        })
      }else if (value.dimension === C_MEASURES) {
        this.formGroup.patchValue({
          ...value,
        })
      }
    } else {
      this.formGroup.patchValue(value)
    }
  }

  trackByName(index, item) {
    return item.name
  }

  patchCalculationProperty(property: CalculationProperty) {
    this.patchValue({
      dimension: C_MEASURES,
      measure: property.name
    })
    this.property$.next({
      ...this.property$.value,
      ...property,
      role: AggregationRole.measure
    })
  }

  toggleMember(name: string, checked: boolean) {
    if (checked) {
      this.members = uniq([...(this.members || []), name])
    } else {
      this.members = this.members?.filter((item) => item !== name)
    }
  }

  async selectMembers(event) {
    event.stopPropagation()

    const result = await firstValueFrom(this._dialog.open(NgmValueHelpComponent, {
      viewContainerRef: this._viewContainerRef,
      data: {
        dsCoreService: this.dsCoreService(),
        dataSettings: this.dataSettings(),
        dimension: cloneDeep(omit(this.formGroup.value, 'level')),
        slicer: {
          exclude: this.exclude,
          members: this.formGroup.value.members
        },
        options: {
          selectionType: FilterSelectionType.Multiple,
          searchable: true,
          initialLevel: 1,
        } as ControlOptions
      }
    }).afterClosed())

    if (result) {
      this.members = result.members
      this.exclude = result.exclude
    }
  }

  async onCreateCalculation(event, calculationType?: CalculationType) {
    event.preventDefault()
    event.stopPropagation()

    const data = {
      dataSettings: this.dataSettings(),
      entityType: this.entityType(),
      syntax: this.syntax(),
      dsCoreService: this.dsCoreService(),
      value: null
    }

    if (calculationType) {
      data.value = {
        calculationType
      }
    }

    this.coreService.openCalculation(data).subscribe((property) => {
      if (property) {
        this.patchCalculationProperty(property)
        this.calculationChange.emit(property)
      }
    })
  }

  async openEditCalculation(calculationProperty: CalculationProperty) {
    const data = {
      dsCoreService: this.dsCoreService(),
      dataSettings: this.dataSettings(),
      entityType: this.entityType(),
      value: calculationProperty,
      syntax: Syntax.MDX,
    }
    this.coreService.openCalculation(data).subscribe((property) => {
      if (property) {
        this.patchCalculationProperty(property)
        this.calculationChange.emit(property)
      }
    })
  }

  async openFormatting(event) {
    const result = await firstValueFrom(this._dialog.open(NgmFormattingComponent, {
        data: this.formGroup.get('formatting').value
      })
      .afterClosed())

    if (result) {
      this.formGroup.get('formatting').setValue(result)
    }
  }

  /**
   * 为 Restricted Measure 创建 Restrict Dimension Input Control
   * Restrict Dimension Input Control: members 成员只取来源于相应 Input Control 的值
   */
  async createCalcInputControl(event) {
    event.preventDefault()
    event.stopPropagation()
    
    // // 暂时使用 name 标识 Dimension 需要创建相应的 Input Control， 后续可改为直接进行创建更详细的 Calculation Input Control
    // const result = await firstValueFrom(this._dialog.open(ConfirmUniqueComponent).afterClosed())
    // if (result) {
    //   this.formGroup.get('name').setValue(result)
    // }
  }

  async openCreateParameter() {
    const result = await firstValueFrom(this._dialog
      .open(NgmParameterCreateComponent, {
        viewContainerRef: this._viewContainerRef,
        data: {
          dsCoreService: this.dsCoreService(),
          dataSettings: this.dataSettings(),
          entityType: this.entityType(),
          // coreService: this.coreService(),
          dimension: pick(this.formGroup.value, 'dimension', 'hierarchy')
        }
      })
      .afterClosed())
    
    if (result) {
      console.log(result)
    }
  }

  async openEditParameter(name?: string) {
    const result = await firstValueFrom(this._dialog
      .open(NgmParameterCreateComponent, {
        viewContainerRef: this._viewContainerRef,
        data: {
          dsCoreService: this.dsCoreService(),
          dataSettings: this.dataSettings(),
          entityType: this.entityType(),
          // coreService: this.coreService(),
          name: name ?? this.formGroup.value.dimension
        }
      })
      .afterClosed())

    if (result) {
      console.log(result)
    }
  }

  focus(options?: FocusOptions): void {
    this._propertySelect?.focus()
  }

  /**
   * Prevent space keydown event to trigger select panel open when searching
   * 
   * @param event 
   */
  onSearchKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.stopPropagation()
    }
  }

  getTranslation(key: string, params?: any) {
    return this.#translate.instant(key, params)
  }
}

export function filterProperty(properties: Property[], text: string) {
  text = text?.trim().toLowerCase()
  if (text) {
    return properties?.filter(
      (property) =>
        property.caption?.toLowerCase().includes(text) ||
        property.name.toLowerCase().includes(text)
    )
  }
  return properties
}
