import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, model, output, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { routeAnimations } from '@metad/core'
import { pick } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import {
  ApiProviderAuthType,
  ApiToolBundle,
  getErrorMessage,
  IXpertToolset,
  TagCategoryEnum,
  ToastrService,
  XpertToolsetCategoryEnum,
  XpertToolsetService
} from 'apps/cloud/src/app/@core'
import { TagSelectComponent } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { distinctUntilChanged, filter, of, switchMap } from 'rxjs'
import { XpertStudioToolAuthorizationComponent } from '../../authorization/authorization.component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { NgmSpinComponent } from '@metad/ocap-angular/common'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkMenuModule,
    TranslateModule,
    EmojiAvatarComponent,
    TagSelectComponent,
    NgmSpinComponent
  ],
  selector: 'pac-xpert-tool-odata-configure',
  templateUrl: './configure.component.html',
  styleUrl: 'configure.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioConfigureODataComponent {
  eTagCategoryEnum = TagCategoryEnum

  private readonly xpertToolsetService = inject(XpertToolsetService)
  readonly #toastr = inject(ToastrService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)
  readonly #cdr = inject(ChangeDetectorRef)
  readonly #fb = inject(FormBuilder)

  readonly loading = signal(false)
  readonly toolset = model<IXpertToolset>(null)

  readonly valueChange = output()

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
      api_key_header_prefix: this.#formBuilder.control(null)
    }),
    tags: this.#formBuilder.control(null),
    privacyPolicy: this.#formBuilder.control(null),
    customDisclaimer: this.#formBuilder.control(null),

    url: this.#fb.control('')
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
    this.formGroup.patchValue({ avatar })
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
    return { ...this.formGroup.value }
  }
  get tags() {
    return this.formGroup.get('tags') as FormControl
  }
  get url() {
    return this.formGroup.get('url') as FormControl
  }

  // readonly schemas = toSignal(
  //   this.schema.valueChanges.pipe(
  //     filter(() => !this.toolset()),
  //     distinctUntilChanged(),
  //     switchMap((schema) => (!schema?.trim() ? of(null) : this.xpertToolsetService.parserOpenAPISchema(schema)))
  //   )
  // )

  constructor() {
    // effect(() => {
    //   if (this.schemas()?.parameters_schema) {
    //     this.tools.clear()
    //     this.schemas().parameters_schema.forEach((schema) => {
    //       this.addTool(schema)
    //     })
    //   }
    // })

    effect(() => {
      this.loading() ? this.formGroup.disable() : this.formGroup.enable()
    })

    effect(
      () => {
        if (this.toolset()) {
          this.formGroup.patchValue({
            ...pick(
              this.toolset(),
              'name',
              'avatar',
              'description',
              'schema',
              'type',
              'category',
              'tags',
              'privacyPolicy',
              'customDisclaimer'
            ),
            credentials: this.toolset().credentials ?? {},
            tools: []
          } as any)
          this.#cdr.detectChanges()
        }
      },
      { allowSignalWrites: true }
    )
  }

  addTool(apiBundle: ApiToolBundle) {
    this.tools.push(
      this.#formBuilder.group({
        enabled: this.#formBuilder.control(false),
        options: this.#formBuilder.control({ api_bundle: apiBundle }),
        name: this.#formBuilder.control(apiBundle.operation_id),
        description: this.#formBuilder.control(apiBundle.summary),
        schema: this.#formBuilder.control(apiBundle.openapi)
      })
    )
  }

  openAuth() {
    const credentials = this.credentials.value ?? {}
    this.#dialog
      .open(XpertStudioToolAuthorizationComponent, {
        data: {
          ...credentials,
          auth_type: credentials.auth_type ? [credentials.auth_type] : [],
          api_key_header_prefix: credentials.api_key_header_prefix ? [credentials.api_key_header_prefix] : []
        }
      })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.formGroup.patchValue({
            credentials: {
              ...value,
              api_key_header_prefix: value.api_key_header_prefix[0],
              auth_type: value.auth_type[0]
            }
          })
          this.formGroup.markAsDirty()
          this.#cdr.detectChanges()
        }
      })
  }

  // Get Metadata
  getMetadata() {
    console.log(this.formGroup.get('url').value)
    this.loading.set(true)
    this.xpertToolsetService.getODataRemoteMetadata(this.url.value).subscribe({
      next: (result) => {
        this.loading.set(false)
        // Handle the success scenario here
        this.formGroup.patchValue({
          schema: result.schema,
          tools: result.tools
        })
        result.tools.forEach((tool) => this.addTool({operation_id: tool.name} as ApiToolBundle))
      },
      error: (err) => {
        this.#toastr.error(getErrorMessage(err))
        this.loading.set(false)
        // Handle the error scenario here
      }
    })
    
  }
}
