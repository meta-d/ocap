import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { FlatTreeControl } from '@angular/cdk/tree'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatCheckboxChange } from '@angular/material/checkbox'
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple
} from '@angular/material/core'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { DisplayBehaviour, filterTreeNodes, FlatNode, TreeNodeInterface } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import isEqual from 'lodash/isEqual'
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  map,
  of,
  startWith
} from 'rxjs'

// Boilerplate for applying mixins to MatButton.
const _TreeSelectBase = mixinColor(
  mixinDisabled(
    mixinDisableRipple(
      class {
        constructor(public _elementRef: ElementRef) {}
      }
    )
  )
)

@UntilDestroy()
@Component({
  selector: 'ngm-tree-select',
  templateUrl: 'tree-select.component.html',
  styleUrls: ['tree-select.component.scss'],
  host: {
    '[attr.disabled]': 'disabled || null',
    '[class._ngm-animation-noopable]': '_animationMode === "NoopAnimations"',
    // Add a class for disabled button styling instead of the using attribute
    // selector or pseudo-selector.  This allows users to create focusabled
    // disabled buttons without recreating the styles.
    '[class.ngm-tree-select-disabled]': 'disabled',
    class: 'ngm-focus-indicator ngm-tree-select'
  },
  inputs: ['disabled', 'disableRipple', 'color'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TreeSelectComponent)
    }
  ]
})
export class TreeSelectComponent<T>
  extends _TreeSelectBase
  implements OnInit, OnChanges, ControlValueAccessor, CanDisable, CanColor, CanDisableRipple
{
  @Input() appearance: MatFormFieldAppearance
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity | string
  @Input() label: string
  @Input() placeholder: string

  @Input() get treeNodes(): TreeNodeInterface<T>[] {
    return this.treeNodes$.value
  }
  set treeNodes(value) {
    this.treeNodes$.next(value)
  }
  private treeNodes$ = new BehaviorSubject<TreeNodeInterface<T>[]>(null)

  @Input() get multiple() {
    return this._multiple
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value)
  }
  private _multiple = false

  @Input() get virtualScroll() {
    return this._virtualScroll
  }
  set virtualScroll(value: boolean | string) {
    this._virtualScroll = coerceBooleanProperty(value)
  }
  private _virtualScroll = false

  @Input() get autocomplete(): boolean {
    return this._autocomplete
  }
  set autocomplete(value: boolean | string) {
    this._autocomplete = coerceBooleanProperty(value)
  }
  private _autocomplete = false

  @Input() get searchable(): boolean {
    return this._searchable
  }
  set searchable(value: boolean | string) {
    this._searchable = coerceBooleanProperty(value)
  }
  private _searchable = false

  @Input() get treeViewer(): boolean {
    return this._treeViewer
  }
  set treeViewer(value: boolean | string) {
    this._treeViewer = coerceBooleanProperty(value)
  }
  private _treeViewer = false

  @Input() loading = false

  @ViewChild('autoInput') autoInput: ElementRef<HTMLInputElement>

  formControl = new FormControl<FlatNode<any>[] | FlatNode<any>>(null)
  get value() {
    return this.formControl.value
  }
  get isNotInitial() {
    return Array.isArray(this.formControl.value) ? this.formControl.value.length : this.formControl.value
  }

  autoControl = new FormControl<string>(null)
  get autoHighlight() {
    return typeof this.autoControl.value === 'string' ? this.autoControl.value : null
  }

  separatorKeysCodes: number[] = [ENTER, COMMA]
  public multipleSelection = new SelectionModel<string>(true)
  public singleSelection = new SelectionModel<string>(false)

  treeNodePaddingIndent = 20
  private transformer = (node: TreeNodeInterface<any>, level: number): FlatNode<any> => {
    return {
      expandable: !!node.children && node.children.length > 0,
      key: node.key,
      label: node.label,
      value: node.value,
      level: level,
      raw: node.raw
    }
  }
  treeControl = new FlatTreeControl<FlatNode<any>>(
    (node) => node.level,
    (node) => node.expandable
  )
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  )
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
  selectOptions$ = this.dataSource.connect({ viewChange: of() })

  public readonly trigger$ = this.formControl.valueChanges.pipe(
    startWith(this.formControl.value),
    map((value) => {
      return (
        (Array.isArray(value) ? value.map((item) => item.label || item.key) : value?.label || value?.key) ??
        this.placeholder
      )
    })
  )

  public readonly chipList$ = combineLatest([
    this.singleSelection.changed.pipe(startWith(null)),
    this.multipleSelection.changed.pipe(startWith(null))
  ]).pipe(
    map(([event, event2]) => {
      return (this.multiple ? this.multipleSelection.selected : this.singleSelection.selected)?.map(
        (key) => this.treeControl.dataNodes.find((item) => item.key === key) ?? { key, label: '' }
      )
    })
  )

  onChange: (input: any) => void
  constructor(elementRef: ElementRef) {
    super(elementRef)
    this.treeNodes$
      .pipe(
        combineLatestWith(
          this.autoControl.valueChanges.pipe(
            filter((value) => !value || typeof value === 'string'),
            startWith(null)
          )
        ),
        map(([treeNodes, text]) => {
          return filterTreeNodes(treeNodes ?? [], text)
        }),
        untilDestroyed(this)
      )
      .subscribe((nodes) => {
        this.dataSource.data = nodes
        this.treeControl.dataNodes.forEach((node) => {
          this.treeControl.expand(node)
        })

        // 重新设置新的值对象引用
        const values = this.formControl.value
        this.formControl.setValue(
          Array.isArray(values)
            ? values.map(({ key }) => this.treeControl.dataNodes.find((item) => item.key === key))
            : this.treeControl.dataNodes.find((item) => item.key === values?.key)
        )
      })
  }

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        filter(() => !this.autocomplete && !this.treeViewer),
        distinctUntilChanged(isEqual),
        untilDestroyed(this)
      )
      .subscribe((value) => {
        this.onChange?.(Array.isArray(value) ? value.map((option) => option.key) : value?.key)
      })

    this.singleSelection.changed
      .pipe(
        filter(() => !this.multiple && (this.autocomplete || this.treeViewer)),
        untilDestroyed(this)
      )
      .subscribe((event) => {
        this.onChange?.(this.singleSelection.selected?.[0])
      })

    this.multipleSelection.changed
      .pipe(
        filter(() => this.multiple && (this.autocomplete || this.treeViewer)),
        untilDestroyed(this)
      )
      .subscribe((event) => {
        this.onChange?.(this.multipleSelection.selected)
      })
  }

  ngOnChanges({ displayDensity }: SimpleChanges): void {
    if (displayDensity) {
      if (this.displayDensity === DisplayDensity.compact) {
        this.treeNodePaddingIndent = 20
      } else if (this.displayDensity === DisplayDensity.cosy) {
        this.treeNodePaddingIndent = 25
      } else {
        this.treeNodePaddingIndent = 30
      }
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      if (this.autocomplete || this.treeViewer) {
        if (this.multiple) {
          this.multipleSelection.select(...obj)
        } else {
          this.singleSelection.select(obj)
        }
      } else {
        if (this.multiple) {
          this.formControl.setValue(
            obj.map((key) => this.treeControl.dataNodes.find((item) => item.key === key) ?? { key })
          )
        } else {
          this.formControl.setValue(
            this.treeControl.dataNodes.find((item) => item.key === obj) ?? ({ key: obj } as FlatNode<any>)
            // { emitEvent: false }
          )
        }
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    //
  }

  compareWith(a: FlatNode<any>, b: FlatNode<any>) {
    return a?.key === b?.key
  }

  displayWith(value: any) {
    return Array.isArray(value) ? value : value?.label || value?.value
  }

  hasChild = (_: number, node: FlatNode<T>) => node.expandable

  isSelected(option: FlatNode<T>) {
    return this.multiple
      ? this.multipleSelection.isSelected(option?.key as string)
      : this.singleSelection.isSelected(option?.key)
  }

  onSelect(node: FlatNode<T>) {
    if (this.multiple) {
      this.multipleSelection.toggle(node.key)
    } else {
      this.singleSelection.select(node.key)
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const key = event.option.value?.key
    if (this.multiple) {
      this.multipleSelection.select(key)
    } else {
      this.singleSelection.select(key)
    }
    this.autoInput.nativeElement.value = ''
    this.autoControl.setValue(null)
  }

  onCheckboxSelect(event: MatCheckboxChange, option: FlatNode<any>) {
    if (this.multiple) {
      this.multipleSelection.toggle(option.key as string)
    } else {
      this.singleSelection.toggle(option.key as string)
    }
  }

  removeChip(event) {
    if (this.multiple) {
      this.multipleSelection.deselect(event.key)
    } else {
      this.singleSelection.deselect(event.key)
    }
  }

  clear(event) {
    event.stopPropagation()
    this.formControl.setValue(null)
  }

  clearSearch(event) {
    event.stopPropagation()
    this.autoControl.setValue(null)
  }

  add(e) {
    //
  }
}
