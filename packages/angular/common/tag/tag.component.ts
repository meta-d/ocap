import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostBinding, Input, Output, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { ISelectOption } from '@metad/ocap-angular/core'
import { map } from 'rxjs/operators'
import { ITagOption } from './types'


@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-tags',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmTagsComponent)
    }
  ]
})
export class NgmTagsComponent implements ControlValueAccessor {

  @HostBinding('class.ngm-tags') isTagsComponent = true

  @Input() tags: ITagOption<string>[] = []
  @Input() exclude = false
  @Input() color: string
  @HostBinding('class.selectable')
  @Input() get selectable() {
    return this._selectable
  }
  set selectable(value: string | boolean) {
    this._selectable = coerceBooleanProperty(value)
  }
  private _selectable = false

  selection = new SelectionModel<string>(true, [])

  @Output() selectedChange = this.selection.changed.pipe(map((change) => change.source.selected))

  _onChange: (value: any) => void = () => {}
  _onTouched: () => void = () => {}

  private selectedSub = this.selection.changed.pipe(map((change) => change.source.selected)).subscribe((selected) => {
    this._onChange(selected)
  })

  toggleTag(tag: ISelectOption<string>) {
    this.selection.toggle(tag.value)
  }

  isSelected(tag: ISelectOption<string>) {
    return this.selection.isSelected(tag.value)
  }

  writeValue(obj: any): void {
    this.selection.clear()
    if (obj) {
        this.selection.select(...obj)
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {}
}
