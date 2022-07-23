import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, forwardRef, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NgmAppearance } from '@metad/ocap-angular/core'
import { DataSettings, Dimension, FlatNode, hierarchize, TreeNodeInterface } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { map } from 'rxjs'
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

  @Input() label: string
  @Input() data: TreeNodeInterface<any>[]

  @Input() dataSettings: DataSettings
  @Input() dimension: Dimension
  @Input() appearance: NgmAppearance
  @Input() initialLevel: number
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

  @Input() get treeViewer(): boolean {
    return this._treeViewer
  }
  set treeViewer(value: boolean | string) {
    this._treeViewer = coerceBooleanProperty(value)
  }
  private _treeViewer = false
  @Input() get searchable(): boolean {
    return this._searchable
  }
  set searchable(value: boolean | string) {
    this._searchable = coerceBooleanProperty(value)
  }
  private _searchable = false

  members = []
  memberKeys
  // treeNodePadding = 40
  // myControl = new FormControl<string | FlatNode<any>>('')
  treeData$ = this.smartFilterService.selectResult().pipe(
    map(({ error, schema, data }) => {
      if (error) {
        console.error(error)
        return null
      }

      this.members = data
      if (schema?.recursiveHierarchy) {
        return hierarchize(data, schema?.recursiveHierarchy)
      }
      return null
    })
  )

  onChange: (input: any) => void
  constructor(private smartFilterService: NgmSmartFilterService) {
  }

  ngOnInit() {
    this.smartFilterService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.smartFilterService.refresh()
      })
  }

  ngOnChanges({ dataSettings, dimension, data, appearance }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.smartFilterService.options = { dimension: dimension.currentValue }
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      this.memberKeys = obj.members?.map((member) => member.value)
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

  onModelChange(event) {
    this.onChange({
      dimension: this.dimension,
      members: Array.isArray(event)
        ? event.map((key) => ({
            value: key,
            label: this.members.find((item) => item.memberKey === key)?.memberCaption
          }))
        : event
        ? [{ value: event, label: this.members.find((item) => item.memberKey === event)?.memberCaption }]
        : null
    })
  }
}
