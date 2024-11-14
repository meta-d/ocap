import { CdkListboxModule } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, inject, input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NgmHighlightDirective } from '@metad/ocap-angular/common'
import { NgmI18nPipe, TSelectOption } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor'

/**
 */
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CdkListboxModule,
    CdkMenuModule,
    NgmI18nPipe,
    NgmHighlightDirective
  ],
  selector: 'ngm-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss'],
  hostDirectives: [NgxControlValueAccessor]
})
export class NgmSelectComponent {
  readonly httpClient = inject(HttpClient)
  protected cva = inject<NgxControlValueAccessor<TSelectOption[] | null>>(NgxControlValueAccessor)
  readonly i18n = new NgmI18nPipe()

  readonly selectOptions = input<TSelectOption[]>()

}
