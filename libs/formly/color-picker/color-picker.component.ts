import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ColorFormat } from '@ng-matero/extensions/colorpicker'
import { FieldType } from '@ngx-formly/material/form-field'
import { NgmColorInputComponent } from '@metad/components/form-field'

@Component({
  standalone: true,
  selector: 'pac-formly-color-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgmColorInputComponent]
})
export class PACFormlyColorPickerComponent extends FieldType<any> {
  @HostBinding('class.pac-formly-color-picker') public _formlyColorPickerComponent = true

  format: ColorFormat = 'hex'
}
