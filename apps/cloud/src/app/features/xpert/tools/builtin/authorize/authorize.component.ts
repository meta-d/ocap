import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, model, output, signal } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { routeAnimations } from '@metad/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { TagCategoryEnum, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { derivedAsync } from 'ngxtension/derived-async'


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
    NgmI18nPipe
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

  readonly provider = input<string>()
  readonly credential = model<Record<string, unknown>>(null)
  readonly close = output()

  readonly loading = signal(false)

  readonly credentialsSchema = derivedAsync(() => {
    if (this.provider()) {
      return this.toolsetService.getBuiltinCredentialsSchema(this.provider())
    }
    return null
  })

  readonly #credential = signal<Record<string, unknown>>(null)

  constructor() {
    effect(() => {
      if (this.credentialsSchema() && this.credentialsSchema().length === 0) {
        this.#credential.set({})
        this.save()
      }
    }, { allowSignalWrites: true })
  }

  getCredential(name: string) {
    return this.#credential()?.[name]
  }

  setCredential(name: string, value: unknown) {
    this.#credential.update((state) => ({
      ...(state ?? {}),
      [name]: value
    }))
  }

  cancel() {
    this.close.emit()
  }

  save() {
    this.credential.set(this.#credential())
    this.close.emit()
  }
}
