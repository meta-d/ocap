import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { NgmInputComponent } from '@metad/ocap-angular/common'
import { ISelectOption, OcapCoreModule } from '@metad/ocap-angular/core'
import { FieldType, FormlyModule } from '@ngx-formly/core'
import { Observable, isObservable, of } from 'rxjs'

@Component({
  standalone: true,
  selector: 'pac-formly-input',
  templateUrl: `input.type.html`,
  styleUrls: [`input.type.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pac-formly-input'
  },
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, OcapCoreModule, NgmInputComponent]
})
export class PACFormlyInputComponent extends FieldType implements OnInit {
  public options$: Observable<ISelectOption[]>

  ngOnInit(): void {
    this.options$ = isObservable(this.props?.options) ? this.props.options : of(this.props?.options ?? [])
  }

  get valueFormControl() {
    return this.formControl as FormControl
  }
}
