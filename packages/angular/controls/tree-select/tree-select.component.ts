import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, forwardRef, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { DisplayDensity, NgmAppearance } from '@metad/ocap-angular/core'
import { DataSettings, Dimension, FlatNode, hierarchize, IMember, TreeNodeInterface } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { debounceTime, EMPTY, map, Observable, of, startWith, switchMap } from 'rxjs'
import { NgmSmartFilterService } from '../smart-filter.service'


@UntilDestroy()
@Component({
  selector: 'ngm-member-tree-select',
  templateUrl: 'tree-select.component.html',
  styleUrls: ['tree-select.component.scss'],
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MemberTreeSelectComponent)
    }
  ]
})
export class MemberTreeSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @HostBinding('class.ngm-member-tree-select') _isMemberTreeSelectComponent = true

  @Input() data: TreeNodeInterface<any>[]

  @Input() dataSettings: DataSettings
  @Input() dimension: Dimension
  @Input() appearance: NgmAppearance

  @Input() get multiple() {
    return this._multiple
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value)
  }
  private _multiple = false

  // private slicer$ = new BehaviorSubject<ISlicer>(null)
  treeNodePadding = 40
  myControl = new FormControl<string | FlatNode<any>>('')
  treeData$ = this.smartFilterService.selectResult().pipe(
    switchMap(({ error, schema, data }) => {
      if (error) {
        console.error(error)
        return EMPTY
      }
      return this.myControl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const name = typeof value === 'string' ? value : value?.key
          const filterValue = name?.toLowerCase()
          return name
            ? data.filter(
                (option) =>
                  option.memberKey.toLowerCase().includes(filterValue) ||
                  option.memberCaption?.toLowerCase().includes(filterValue)
              )
            : data.slice()
        }),
        map((data) => {
          if (schema?.recursiveHierarchy) {
            return hierarchize(data, schema?.recursiveHierarchy)
          }
          return null
        })
      )
    })
  )

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
  filteredOptions: Observable<FlatNode<any>[]> = this.dataSource.connect({ viewChange: of() })

  onChange: (input: any) => void
  constructor(private smartFilterService: NgmSmartFilterService) {
    this.smartFilterService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.smartFilterService.refresh()
      })

    this.treeData$.pipe(untilDestroyed(this)).subscribe((data) => {
      this.dataSource.data = data
    })
  }

  ngOnInit() {
    this.myControl.valueChanges.pipe(debounceTime(500), untilDestroyed(this)).subscribe((value) => {
      let members: IMember[]
      if (typeof value === 'string') {
        members = value ? [{ value }] : null
      } else {
        members = value ? [{ value: value.key, label: value.label }] : null
      }

      this.onChange?.({
        members,
        dimension: this.dimension
      })
    })
  }

  ngOnChanges({ dataSettings, dimension, data, appearance }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.smartFilterService.options = { dimension: dimension.currentValue }
    }

    if (data) {
      this.dataSource.data = data.currentValue
    }

    if (appearance?.currentValue) {
      if (this.appearance.displayDensity === DisplayDensity.compact) {
        this.treeNodePadding = 18
      } else if (this.appearance.displayDensity === DisplayDensity.cosy) {
        this.treeNodePadding = 24
      } else {
        this.treeNodePadding = 30
      }
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      console.log(obj.members?.[0]?.value)
      this.myControl.setValue(obj.members?.[0]?.value)
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

  displayFn(item: FlatNode<any>): string {
    return typeof item === 'string' ? item : item?.label || item?.key
  }
}
