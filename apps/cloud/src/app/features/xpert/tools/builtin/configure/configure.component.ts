import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, model, signal } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { routeAnimations } from '@metad/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IBuiltinTool, IToolProvider, TagCategoryEnum, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { TagSelectComponent } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { derivedAsync } from 'ngxtension/derived-async'
import { XpertToolBuiltinAuthorizeComponent } from '../authorize/authorize.component'
import { XpertToolBuiltinParametersComponent } from '../parameters/parameters.component'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    EmojiAvatarComponent,
    TagSelectComponent,
    NgmI18nPipe,

    XpertToolBuiltinAuthorizeComponent,
    XpertToolBuiltinParametersComponent
  ],
  selector: 'xpert-tool-configure-builtin',
  templateUrl: './configure.component.html',
  styleUrl: 'configure.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertToolConfigureBuiltinComponent {
  eTagCategoryEnum = TagCategoryEnum
  private readonly xpertToolsetService = inject(XpertToolsetService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)
  readonly #cdr = inject(ChangeDetectorRef)
  readonly #dialogRef = inject(MatDialogRef<XpertToolConfigureBuiltinComponent>)
  readonly #data = inject<{provider: IToolProvider}>(MAT_DIALOG_DATA)

  readonly loading = input<boolean>()

  readonly provider = signal(this.#data.provider)
  readonly tools = derivedAsync(() => {
    if (this.provider()) {
      return this.xpertToolsetService.getBuiltinTools(this.provider().name)
    }
    return null
  })

  readonly authorizing = signal(false)
  readonly authorized = signal(false)

  readonly credential = model<Record<string, unknown>>(null)

  readonly showTool = signal<string>(null)

  constructor() {
    effect(() => {
      if (this.credential()) {
        this.authorized.set(true)
      }
    }, { allowSignalWrites: true })
  }

  openAuthorize() {
    this.authorizing.set(true)
    this.authorized.set(false)
  }

  closeAuthorize() {
    this.authorizing.set(false)
  }

  cancel(event: MouseEvent) {
    this.#dialogRef.close()
    event.preventDefault()
  }

  toggleTool(tool: IBuiltinTool) {
    this.showTool.update((state) => state === tool.identity.name ? null : tool.identity.name)
  }
}
