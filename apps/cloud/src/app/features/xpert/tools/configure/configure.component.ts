import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, inject, input, model } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { routeAnimations } from '@metad/core'
import { omit, pick } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { ApiProviderAuthType, ApiToolBundle, IXpertToolset, TAvatar, XpertToolsetCategoryEnum, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { distinctUntilChanged, filter, of, switchMap } from 'rxjs'
import { XpertStudioToolAuthorizationComponent } from '../authorization/authorization.component'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { TagSelectComponent } from 'apps/cloud/src/app/@shared'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule, EmojiAvatarComponent, TagSelectComponent],
  selector: 'pac-xpert-tool-configure',
  templateUrl: './configure.component.html',
  styleUrl: 'configure.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioConfigureToolComponent {
  private readonly xpertToolsetService = inject(XpertToolsetService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)

  readonly loading = input<boolean>()
  readonly toolset = model<IXpertToolset>(null)

  readonly formGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    avatar: new FormControl(null),
    description: new FormControl(null),
    schema: new FormControl<string>(null, [Validators.required]),
    type: this.#formBuilder.control('openapi'),
    category: this.#formBuilder.control(XpertToolsetCategoryEnum.API),
    tools: new FormArray([]),
    credentials: this.#formBuilder.group({
      auth_type: this.#formBuilder.control(ApiProviderAuthType.NONE),
      api_key_header: this.#formBuilder.control(null),
      api_key_value: this.#formBuilder.control(null),
      api_key_header_prefix: this.#formBuilder.control(null),
    })
  })
  get invalid() {
    return this.formGroup.invalid
  }
  get name() {
    return this.formGroup.get('name')
  }
  get avatar() {
    return this.formGroup.get('avatar').value
  }
  set avatar(avatar) {
    this.formGroup.patchValue({avatar})
  }
  get schema() {
    return this.formGroup.get('schema')
  }
  get credentials() {
    return this.formGroup.get('credentials') as FormControl
  }
  get tools() {
    return this.formGroup.get('tools') as FormArray
  }
  get value() {
    return {...this.formGroup.value}
  }

  readonly schemas = toSignal(
    this.schema.valueChanges.pipe(
      filter(() => !this.toolset()),
      distinctUntilChanged(),
      switchMap((schema) => (!schema?.trim() ? of(null) : this.xpertToolsetService.parserOpenAPISchema(schema)))
    )
  )

  constructor() {
    effect(() => {
      if (this.schemas()?.parameters_schema) {
        this.tools.clear()
        this.schemas().parameters_schema.forEach((schema) => {
          this.addTool(schema)
        })
      }
    })

    effect(() => {
      this.loading() ? this.formGroup.disable() : this.formGroup.enable()
    })

    effect(() => {
      if (this.toolset()) {
        this.formGroup.patchValue({
          ...pick(this.toolset(), 'name', 'avatar', 'description', 'schema', 'type', 'category',),
          credentials: this.toolset().credentials ?? {},
          tools: []
        } as any)
      }
    })
  }

  addTool(apiBundle: ApiToolBundle) {
    this.tools.push(this.#formBuilder.group({
      enabled: this.#formBuilder.control(false),
      options: this.#formBuilder.control({api_bundle: apiBundle}),
      name: this.#formBuilder.control(apiBundle.operation_id),
      description: this.#formBuilder.control(apiBundle.summary),
      schema: this.#formBuilder.control(apiBundle.openapi)
    }))
  }

  openAuth() {
    const credentials = this.credentials.value ?? {}
    this.#dialog.open(XpertStudioToolAuthorizationComponent, {
      data: {
        ...credentials,
        auth_type: credentials.auth_type ? [credentials.auth_type] : [],
        api_key_header_prefix: credentials.api_key_header_prefix ? [credentials.api_key_header_prefix] : [],
      }
    })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.formGroup.patchValue({
            credentials: {
              ...value,
              api_key_header_prefix: value.api_key_header_prefix[0],
              auth_type: value.auth_type[0],
            }
          })
        }
      })
  }
}
