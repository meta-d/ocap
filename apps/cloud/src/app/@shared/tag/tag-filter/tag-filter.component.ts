import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, forwardRef, input, model } from '@angular/core'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { ITag } from '../../../@core'
import { CdkMenuModule } from '@angular/cdk/menu'
import { NgmI18nPipe } from '@metad/ocap-angular/core'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CdkListboxModule, CdkMenuModule, NgmI18nPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tag-filter',
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagFilterComponent),
      multi: true
    }
  ]
})
export class TagFilterComponent implements ControlValueAccessor {

  readonly allTags = input<ITag[]>()
  
  readonly tags = model<ITag[]>([])

  private _onChange: (value: ITag[]) => void
  private _onTouched: (value: ITag[]) => void

  writeValue(obj: ITag[]): void {
    this.tags.set(obj)
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    //
  }

  compareWith(a: ITag, b: ITag) {
    return a.id === b.id
  }

  onTagChange() {
    this._onChange?.(this.tags())
  }
}
