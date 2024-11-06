import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core'
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { injectParams } from 'ngxtension/inject-params'
import { getErrorMessage, IXpertTool, IXpertToolset, routeAnimations, ToastrService, XpertToolsetService } from '../../../../@core'
import { XpertStudioConfigureToolComponent } from '../openapi/'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { ButtonGroupDirective, DensityDirective, NgmDensityDirective, NgmI18nPipe } from '@metad/ocap-angular/core'
import { MatDialog } from '@angular/material/dialog'
import { NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'
import { distinctUntilChanged, switchMap } from 'rxjs/operators'
import { EMPTY, of } from 'rxjs'
import { toObservable } from '@angular/core/rxjs-interop'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { omit } from 'lodash-es'
import { XpertToolsetToolTestComponent } from '../tool-test/test/tool.component'
import { XpertStudioConfigureODataComponent } from '../odata'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    ButtonGroupDirective,
    DensityDirective,
    NgmI18nPipe,
    NgmDensityDirective,
    EmojiAvatarComponent,
    XpertStudioConfigureToolComponent,
    XpertStudioConfigureODataComponent,
    XpertToolsetToolTestComponent
  ],
  selector: 'pac-xpert-api-tool',
  templateUrl: './api-tool.component.html',
  styleUrl: 'api-tool.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioAPIToolComponent {
  readonly paramId = injectParams('id')
  readonly toolsetService = inject(XpertToolsetService)
  readonly #toastr = inject(ToastrService)
  readonly #dialog = inject(MatDialog)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #fb = inject(FormBuilder)

  readonly toolset = model<IXpertToolset>(null)
  readonly avatar = computed(() => this.toolset()?.avatar)

  readonly tool = model<IXpertTool>(null)
  readonly parameters = model<Record<string, any>>(null)
  readonly testResult = signal(null)

  readonly toolAvatar = computed(() => this.tool()?.avatar ?? this.toolset()?.avatar)

  readonly formGroup = this.#fb.group({
    // avatar: this.#fb.control(null),
    description: this.#fb.control(null),
  })
  get description() {
    return this.formGroup.get('description') as FormControl
  }

  readonly loading = signal(false)

  private toolsetSub = toObservable(this.paramId).pipe(
    distinctUntilChanged(),
    switchMap((id) => id ? this.toolsetService.getById(this.paramId(), { relations: ['tools', 'createdBy'] }) : of(null))
  ).subscribe({
    next: (value) => {
      this.toolset.set(value)
      this.formGroup.patchValue(value)
    },
    error: (error) => {
      this.#toastr.error(getErrorMessage(error))
    }
  })

  constructor() {
    effect(() => {
      // console.log(this.toolset())
    })
  }

  saveToolset() {
    this.loading.set(true)
    this.toolsetService.update(this.toolset().id, {
      ...this.toolset(),
      ...this.formGroup.value
    }).subscribe({
      next: () => {
        this.#toastr.success('PAC.Messages.UpdatedSuccessfully', { Default: 'Updated Successfully!' })
        this.loading.set(false)
      },
      error: (error) => {
        this.#toastr.error(getErrorMessage(error))
        this.loading.set(false)
      }
    })
  }

  onConfigChange(value: Partial<IXpertToolset>) {
    this.updateToolset(value)
  }

  updateToolset(value: Partial<IXpertToolset>) {
    this.toolset.update((state) => ({
      ...state,
      ...omit(value, 'tools')
    }))
  }

  selectTool(tool: IXpertTool) {
    this.tool.set(tool)
    this.parameters.set(null)
  }

  updateTool(id: string, value: Partial<IXpertTool>) {
    this.toolset.update((state) => {
      const index = state.tools.findIndex((item) => item.id === id)
      if (index > -1) {
        state.tools[index] = {
          ...state.tools[index],
          ...value
        }
      }
      return state
    })
  }

  onParameter(name: string, event: any) {
    this.parameters.update((state) => ({
      ...(state ?? {}),
      [name]: event
    }))
  }

  saveAsDefault() {
    this.updateTool(this.tool().id, {parameters: this.parameters()})
  }

  testTool() {
    this.loading.set(true)
    this.testResult.set(null)
    this.toolsetService.testOpenAPI({
      ...this.tool(),
      parameters: this.parameters(),
      toolset: this.toolset(),
    }).subscribe({
      next: (result) => {
        this.loading.set(false)
        if (result) {
          this.testResult.set(JSON.stringify(result, null, 4))
        } else {
          this.testResult.set(null)
        }
      },
      error: (error) => {
        this.#toastr.error(getErrorMessage(error))
        this.loading.set(false)
      }
    })
  }

  deleteToolset() {
    const toolset = this.toolset()
    this.#dialog
      .open(NgmConfirmDeleteComponent, {
        data: {
          value: toolset.name,
          information: `Delete all tools of toolset:\n ${toolset.description || toolset.name}`
        }
      })
      .afterClosed()
      .pipe(switchMap((confirm) => (confirm ? this.toolsetService.delete(toolset.id) : EMPTY)))
      .subscribe({
        next: () => {
          this.#toastr.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully!' }, toolset.name)
          this.#router.navigate(['/xpert'])
        },
        error: (error) => {
          this.#toastr.error(getErrorMessage(error))
        }
      })
  }

  cancel() {
    this.#router.navigate(['/xpert'])
  }
}
