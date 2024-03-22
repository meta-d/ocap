import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { nonNullable } from '@metad/core'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { FieldType, FormlyModule } from '@ngx-formly/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { EMPTY, Observable, catchError, startWith } from 'rxjs'

/**
 * @deprecated default use 'key' as the key field of select option, don't specify the `valueKey` in `props`
 */
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
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormlyModule,

    TranslateModule,

    OcapCoreModule,
    NgmSelectComponent
  ]
})
export class PACFormlySelectComponent extends FieldType implements OnInit {
  readonly #translate = inject(TranslateService)
  readonly #destroyRef = inject(DestroyRef)

  get valueFormControl() {
    return this.formControl as FormControl
  }

  readonly selectOptions = signal<Array<any>>([])
  readonly value = signal(null)
  readonly error = signal<string>('')

  #validatorEffectRef = effect(
    () => {
      if (nonNullable(this.value()) && !this.selectOptions().find((option) => option[this.props?.valueKey ?? 'value'] === this.value())) {
        this.error.set(
          this.#translate.instant('FORMLY.COMMON.NotFoundValue', { Default: 'Not found value: ' }) + this.value()
        )
      } else {
        this.error.set(null)
      }
    },
    { allowSignalWrites: true }
  )

  ngOnInit(): void {
    this.valueFormControl.valueChanges
      .pipe(startWith(this.valueFormControl.value), takeUntilDestroyed(this.#destroyRef))
      .subscribe((value) => {
        this.value.set(value)
      })

    if (this.props?.options instanceof Observable) {
      this.props.options
        .pipe(
          catchError((err) => {
            this.valueFormControl.setErrors({
              error: this.#translate.instant('FORMLY.Select.UnableLoadOptionList', {
                Default: 'Unable to load option list'
              })
            })
            return EMPTY
          }),
          takeUntilDestroyed(this.#destroyRef)
        )
        .subscribe((event) => {
          // Reset errors
          this.valueFormControl.setErrors(null)
          this.selectOptions.set(event)
          // this._selectOptions$.next(event)
        })
    } else if (this.props?.options) {
      this.selectOptions.set(this.props.options)
      // this._selectOptions$.next(this.props.options)
    }
  }
}
