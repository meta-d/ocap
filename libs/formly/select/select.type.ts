import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { FieldType, FormlyModule } from '@ngx-formly/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, EMPTY, Observable, catchError } from 'rxjs'


@Component({
  standalone: true,
  selector: 'pac-formly-select',
  templateUrl: `select.type.html`,
  styleUrls: [`select.type.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pac-formly-select'
  },
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormlyModule,

    TranslateModule,

    OcapCoreModule,
    NgmSelectComponent
  ]
})
export class PACFormlySelectComponent extends FieldType implements OnInit {
  private translateService = inject(TranslateService)
  private destroyRef = inject(DestroyRef)

  get valueFormControl() {
    return this.formControl as FormControl
  }

  public _selectOptions$ = new BehaviorSubject<Array<any>>([])

  ngOnInit(): void {
    if (this.props?.options instanceof Observable) {
      this.props.options
        .pipe(
          catchError((err) => {
            this.valueFormControl.setErrors({
              error: this.translateService.instant('FORMLY.Select.UnableLoadOptionList', {
                Default: 'Unable to load option list'
              })
            })
            return EMPTY
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((event) => {
          // Reset errors
          this.valueFormControl.setErrors(null)
          this._selectOptions$.next(event)
        })
    } else if (this.props?.options) {
      this._selectOptions$.next(this.props.options)
    }
  }
}
