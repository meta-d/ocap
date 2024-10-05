import { CdkListboxModule } from '@angular/cdk/listbox'
import { Component, computed, effect, inject, model, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayBehaviour, nonBlank } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { injectParams } from 'ngxtension/inject-params'
import { distinctUntilChanged, filter, firstValueFrom, map, switchMap } from 'rxjs'
import {
  CopilotRoleService,
  getErrorMessage,
  ICopilotRole,
  IXpertToolset,
  IKnowledgebase,
  KnowledgebaseService,
  OrderTypeEnum,
  ToastrService
} from '../../../../@core'
import { TOOLSETS } from '../../../../@core/copilot'
import { AvatarEditorComponent, MaterialModule, UpsertEntityComponent } from '../../../../@shared'
import { KnowledgebaseListComponent, ToolsetListComponent } from '../../../../@shared/copilot'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  imports: [
    RouterModule,
    TranslateModule,
    MaterialModule,
    CdkListboxModule,
    FormsModule,
    ReactiveFormsModule,
    NgmCommonModule,
    AvatarEditorComponent,
    KnowledgebaseListComponent,
    ToolsetListComponent
  ]
})
export class CopilotRoleComponent extends UpsertEntityComponent<ICopilotRole> {
  DisplayBehaviour = DisplayBehaviour

  readonly roleService = inject(CopilotRoleService)
  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly _toastrService = inject(ToastrService)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly dialog = inject(MatDialog)
  readonly fb = inject(FormBuilder)
  readonly paramId = injectParams('id')

  readonly loading = signal(true)

  readonly copilotRole = signal<ICopilotRole>(null)

  readonly formGroup = this.fb.group({
    avatar: new FormControl<string>(null),
    name: new FormControl<string>(null),
    title: new FormControl(null),
    titleCN: new FormControl(null),
    description: new FormControl(null),
    prompt: new FormControl(null),
    starters: new FormArray([
      new FormControl(null),
      new FormControl(null),
      new FormControl(null),
      new FormControl(null),
    ]),
    toolsets: new FormControl(null),
    options: new FormControl(null),
  })
  get toolsets() {
    return this.formGroup.get('toolsets').value
  }
  set toolsets(value) {
    this.formGroup.patchValue({ toolsets: value })
    this.formGroup.markAsDirty()
  }
  get options() {
    return this.formGroup.get('options') as FormControl
  }

  readonly knowledgebaseList = toSignal(
    this.knowledgebaseService.getAll({ order: { createdAt: OrderTypeEnum.DESC } }).pipe(map(({ items }) => items))
  )
  readonly knowledgebases = model<IKnowledgebase[]>([])

  readonly knowledgebasesDirty = computed(() => {
    return (
      this.knowledgebases().length !== this.copilotRole()?.knowledgebases?.length ||
      this.knowledgebases().some((kb) => !this.copilotRole().knowledgebases.some((item) => item.id === kb.id))
    )
  })
  readonly toolsetList = signal<IXpertToolset[]>(TOOLSETS)

  private roleSub = toObservable(this.paramId)
    .pipe(
      distinctUntilChanged(),
      filter(nonBlank),
      switchMap((id) => this.roleService.getById(id, { relations: ['knowledgebases'] })),
      takeUntilDestroyed()
    )
    .subscribe((role) => {
      this.copilotRole.set(role)
    })

  constructor(roleService: CopilotRoleService) {
    super(roleService)

    effect(
      () => {
        if (this.copilotRole()) {
          this.formGroup.patchValue({...this.copilotRole(), options: this.copilotRole().options ? JSON.stringify(this.copilotRole().options, null, 2) : null})
          this.knowledgebases.set([...(this.copilotRole().knowledgebases ?? [])])
        } else {
          this.formGroup.reset()
        }
        this.formGroup.markAsPristine()
        this.loading.set(false)
      },
      { allowSignalWrites: true }
    )
  }

  close(refresh = false) {
    this.#router.navigate(['../'], { relativeTo: this.#route })
  }

  async saveAll() {
    try {
      if (this.formGroup.dirty) {
        if (this.paramId()) {
          await firstValueFrom(this.update(this.paramId(), { ...this.formGroup.value, options: 
            this.formGroup.value.options ? JSON.parse(this.formGroup.value.options) : null }))
        } else {
          this.copilotRole.set(await firstValueFrom(this.save({ ...this.formGroup.value })))
        }
      }
      // Update knowledgebases
      if (this.knowledgebasesDirty()) {
        await firstValueFrom(
          this.roleService.updateKnowledgebases(
            this.copilotRole().id,
            this.knowledgebases().map(({ id }) => id)
          )
        )
      }

      this._toastrService.success('PAC.Messages.UpdatedSuccessfully', { Default: 'Updated Successfully!' })
      this.close()
    } catch (error) {
      this._toastrService.error(getErrorMessage(error))
    }
  }

  compareId(a: IKnowledgebase, b: IKnowledgebase): boolean {
    return a?.id === b?.id
  }
}
