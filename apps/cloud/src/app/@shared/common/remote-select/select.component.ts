import { CdkListboxModule, ListboxValueChangeEvent } from '@angular/cdk/listbox'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { booleanAttribute, Component, computed, inject, input } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { toParams } from '@metad/core'
import { NgmHighlightDirective } from '@metad/ocap-angular/common'
import { ISelectOption, NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor'
import { derivedAsync } from 'ngxtension/derived-async'
import { debounceTime, startWith } from 'rxjs'

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
  selector: 'remote-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss'],
  hostDirectives: [NgxControlValueAccessor]
})
export class RemoteSelectComponent {
  readonly httpClient = inject(HttpClient)
  protected cva = inject<NgxControlValueAccessor<string[] | null>>(NgxControlValueAccessor)
  readonly i18n = new NgmI18nPipe()

  // Inputs
  readonly url = input<string>()
  readonly params = input<Record<string, unknown>>()
  readonly multiple = input<boolean, boolean | string>(false, {
    transform: booleanAttribute
  })
  readonly placeholder = input<string>()

  readonly searchControl = new FormControl()
  readonly values = this.cva.value$

  readonly selectOptions = derivedAsync(() => {
    return this.url() ? this.httpClient.get<ISelectOption[]>(this.url(), { params: this.params() ? toParams(this.params()) : null }) : []
  })

  readonly searchText = toSignal<string>(this.searchControl.valueChanges.pipe(debounceTime(300), startWith(null)))
  readonly filteredSelectOptions = computed(() => {
    const text = this.searchText()?.trim().toLowerCase()
    return text
      ? this.selectOptions()?.filter((_) => this.i18n.transform(_.label)?.toLowerCase().includes(text))
      : this.selectOptions()
  })

  readonly selectedOptions = computed(() => {
    return this.values()?.map((value) => this.selectOptions()?.find((_) => _.value === value) ?? { value })
  })

  selectValues(event: ListboxValueChangeEvent<string>) {
    this.cva.value$.set([...event.value])
  }

  checkedWith(value: string) {
    return this.values()?.some((_) => _ === value)
  }
}
