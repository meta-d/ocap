import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { routeAnimations } from '@metad/core'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import {
  getErrorMessage,
  IXpertToolset,
  IXpertWorkspace,
  TagCategoryEnum,
  ToastrService,
  TToolCredentials,
  XpertToolsetService
} from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { derivedAsync } from 'ngxtension/derived-async'
import { of } from 'rxjs'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    EmojiAvatarComponent,
    NgmI18nPipe,
    NgmSpinComponent
  ],
  selector: 'xpert-tool-builtin-authorize',
  templateUrl: './authorize.component.html',
  styleUrl: 'authorize.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertToolBuiltinAuthorizeComponent {
  eTagCategoryEnum = TagCategoryEnum

  readonly toolsetService = inject(XpertToolsetService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)
  readonly #cdr = inject(ChangeDetectorRef)
  readonly #toastr = inject(ToastrService)
  readonly #destroyRef = inject(DestroyRef)

  readonly workspace = input<IXpertWorkspace>()
  readonly provider = input<string>()
  readonly toolset = model<IXpertToolset>()
  readonly credentials = model<Record<string, unknown>>(null)
  readonly close = output<boolean>()

  readonly loading = signal(false)

  readonly credentialsSchema = derivedAsync(() => {
    if (this.provider()) {
      return this.toolsetService.getBuiltinCredentialsSchema(this.provider())
    }
    return null
  })

  readonly toolsetId = computed(() => this.toolset()?.id)
  readonly toolsetCredentials = derivedAsync(() => {
    return this.toolsetId() ? this.toolsetService.getOneById(this.toolsetId()) : of(null)
  })

  readonly toolsetName = model<string>()
  readonly #credentials = signal<TToolCredentials>(null)

  constructor() {
    effect(
      () => {
        if (this.credentialsSchema() && this.credentialsSchema().length === 0) {
          this.#credentials.set({})
          this.save()
        }
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      if (this.toolsetCredentials()) {
        this.#credentials.set(this.toolsetCredentials()?.credentials)
      }
    }, { allowSignalWrites: true })

    effect(() => {
      if (this.toolset()) {
        this.toolsetName.set(this.toolset().name)
      }
    }, { allowSignalWrites: true })
  }

  getCredential(name: string) {
    return this.#credentials()?.[name]
  }

  setCredential(name: keyof TToolCredentials, value: string | number | boolean) {
    this.#credentials.update((state) => ({
      ...(state ?? {}),
      [name]: value
    }))
  }

  remove() {
    this.loading.set(true)
    this.toolsetService.delete(this.toolsetId()).subscribe({
      next: () => {
        this.#toastr.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully' })
        this.loading.set(false)
        this.credentials.set(null)
        this.toolset.set(null)
        this.close.emit(true)
      },
      error: (err) => {
        this.#toastr.error(getErrorMessage(err))
        this.loading.set(false)
      }
    })
  }

  cancel() {
    this.close.emit(false)
  }

  save() {
    this.loading.set(true)
    this.toolsetService.createBuiltinToolsetInstance(this.provider(), {name: this.toolsetName(), credentials: this.#credentials()})
    .pipe(takeUntilDestroyed(this.#destroyRef))
    .subscribe({
      next: (toolset) => {
        this.#toastr.success('PAC.Messages.CreatedSuccessfully', { Default: 'Created successfully' }, toolset.type)
        this.loading.set(false)
        this.credentials.set(this.#credentials())
        this.toolset.set(toolset)
        this.close.emit(true)
      },
      error: (err) => {
        this.#toastr.error(getErrorMessage(err))
        this.loading.set(false)
      }
    })
  }
}
