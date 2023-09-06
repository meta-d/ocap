import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormGroup } from '@angular/forms'
import { pick } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { BusinessAreasService, ToastrService } from '@metad/cloud/state'
import { FORMLY_W_1_2 } from '@metad/formly'
import { TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { firstValueFrom, map } from 'rxjs'
import { BusinessAreaComponent } from '../business-area/business-area.component'
import { BusinessAreasComponent } from '../business-areas/areas.component'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-area-info-form',
  template: `
    <formly-form [form]="form" [fields]="fields()" [model]="model" (modelChange)="onFormChange(model)"> </formly-form>
    <button mat-flat-button color="primary" displayDensity="cosy" (click)="save()" [disabled]="form.invalid">
      {{ 'PAC.ACTIONS.SAVE' | translate: { Default: 'Save' } }}
    </button>
  `
})
export class BusinessAreaInfoFormComponent extends TranslationBaseComponent {
  private readonly businessAreasService = inject(BusinessAreasService)
  private readonly businessAreaComponent = inject(BusinessAreaComponent)
  private readonly businessAreasComponent = inject(BusinessAreasComponent)
  private readonly _toastrService = inject(ToastrService)

  //Fields for the form
  public form = new FormGroup({})
  model = {} as any

  fields = toSignal(
    this.translateService.stream('PAC.BUSINESS_AREA.BASIC_INFO_FORM', { Default: {} }).pipe(
      map((TRANSLATE) => {
        return [
          {
            className: FORMLY_W_1_2,
            key: 'name',
            type: 'input',
            props: {
              label: TRANSLATE?.Name ?? 'Name',
              placeholder: ''
            }
          }
        ]
      })
    )
  )

  private _businessAreaSub = this.businessAreaComponent.businessArea$.subscribe((value) => {
    this.form.patchValue(value)
    this.model = value
  })

  onFormChange(model) {
    //
  }

  async save() {
    try {
      await firstValueFrom(this.businessAreasService.update(this.model.id, pick(this.model, 'name')))
      this.businessAreasComponent.refresh()
      this._toastrService.success('PAC.BUSINESS_AREA.Update', { Default: 'Update' })
    } catch (err) {
      this._toastrService.error('PAC.BUSINESS_AREA.Update', '', { Default: 'Update' })
    }
  }
}
