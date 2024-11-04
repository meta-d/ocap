import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, model, signal } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { routeAnimations } from '@metad/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import {
  getErrorMessage,
  IXpertToolset,
  IXpertWorkspace,
  TagCategoryEnum,
  ToastrService,
  XpertToolsetService
} from 'apps/cloud/src/app/@core'
import { TagSelectComponent } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { derivedAsync } from 'ngxtension/derived-async'
import { BehaviorSubject, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { XpertToolBuiltinAuthorizeComponent } from '../authorize/authorize.component'
import { XpertToolBuiltinToolComponent } from '../tool/tool.component'

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
    XpertToolBuiltinToolComponent
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
  readonly #toastr = inject(ToastrService)
  readonly #dialogRef = inject(MatDialogRef<XpertToolConfigureBuiltinComponent>)
  readonly #data = inject<{
    workspace: IXpertWorkspace
    providerName: string
    toolset: IXpertToolset
  }>(MAT_DIALOG_DATA)

  readonly #refresh$ = new BehaviorSubject<void>(null)

  readonly toolset = model<IXpertToolset>(this.#data.toolset)
  readonly providerName = signal(this.#data.providerName)
  readonly workspace = signal(this.#data.workspace)

  readonly provider = derivedAsync(() =>
    this.providerName() ? this.xpertToolsetService.getProvider(this.providerName()) : of(null)
  )

  readonly tools = derivedAsync(() => {
    if (this.providerName()) {
      return this.xpertToolsetService.getBuiltinTools(this.providerName())
    }
    return null
  })

  readonly toolsets = derivedAsync(() => {
    if (this.providerName() && !this.toolset()) {
      return this.#refresh$.pipe(
        switchMap(() => this.xpertToolsetService.getBuiltinToolInstances(this.workspace(), this.providerName())),
        map(({ items }) => items)
      )
    }
    return null
  })

  readonly loading = signal(false)
  readonly authorizing = signal(false)

  readonly credentials = model<Record<string, unknown>>(null)

  readonly dirty = signal<boolean>(false)

  constructor() {
    effect(() => {
      console.log(this.toolset())
    })
    // effect(() => {
    //   if (this.credentials()) {
    //     this.authorized.set(true)
    //   }
    // }, { allowSignalWrites: true })
  }

  openAuthorize(toolset?: IXpertToolset) {
    this.toolset.set(toolset)
    this.authorizing.set(true)
    // this.authorized.set(false)
  }

  closeAuthorize(refresh: boolean) {
    this.authorizing.set(false)
    if (refresh) {
      this.#refresh$.next()
    }
  }

  cancel(event: MouseEvent) {
    this.#dialogRef.close()
    event.preventDefault()
  }

  getToolEnabled(name: string) {
    return this.toolset()?.tools?.find((_) => _.name === name)?.enabled
  }

  setToolEnabled(name: string, enabled: boolean) {
    const tool = this.toolset().tools?.find((_) => _.name === name)
    if (tool) {
      tool.enabled = enabled
    } else {
      this.toolset.update((state) => {
        return {
          ...state,
          tools: [
            ...(state.tools ?? []),
            {
              name,
              enabled
            }
          ]
        }
      })
    }

    this.dirty.set(true)
  }

  save() {
    this.loading.set(true)
    this.xpertToolsetService.update(this.toolset().id, this.toolset()).subscribe({
      next: (toolset) => {
        this.#toastr.success('PAC.Messages.UpdatedSuccessfully', { Default: 'Updated successfully' })
        this.loading.set(false)
        this.#dialogRef.close(toolset)
      },
      error: (err) => {
        this.#toastr.error(getErrorMessage(err))
        this.loading.set(false)
      }
    })
  }
}
