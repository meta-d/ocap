import { CommonModule } from '@angular/common'
import { Component, Input, NgModule } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { FormlyFormOptions, FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { PACFormlyArrayModule } from '../array'

@Component({
  selector: 'pac-formly-form-pannel',
  template: `<formly-form
    [form]="formGroup"
    [fields]="fields"
    [model]="model"
    (modelChange)="onModelChange($event)"
    [options]="options"
  ></formly-form>
<button type="submit" mat-button color="primary" (click)="onSubmit()">Submit</button>
<button type="button" mat-button (click)="options.resetModel()">Reset</button>
<button type="button" mat-button (click)="options.updateInitialValue()">Update Intial Values</button>
`,
  styles: [``],
})
export class NxFormlyFormPannelComponent {
  public formGroup = new FormGroup({})
  @Input() fields
  @Input() model = {}
  @Input() options: FormlyFormOptions = {}

  onModelChange(event) {
    console.warn(event)
  }

  onSubmit() {
    console.warn(this.model)
  }
}

@NgModule({
  declarations: [NxFormlyFormPannelComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    MatButtonModule,
    PACFormlyArrayModule
  ],
  exports: [NxFormlyFormPannelComponent]
})
export class NxFormlyFormModule { }
