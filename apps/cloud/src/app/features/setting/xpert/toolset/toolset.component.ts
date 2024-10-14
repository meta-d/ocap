import { CdkListboxModule } from '@angular/cdk/listbox'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { nonBlank } from '@metad/copilot'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { assign } from 'lodash-es'
import { injectParams } from 'ngxtension/inject-params'
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators'
import {
  convertConfigurationSchema,
  IXpertToolset,
  KnowledgebaseService,
  TAvatar,
  ToastrService,
  TOOLSET_TYPES,
  XpertToolsetService
} from '../../../../@core'
import { AvatarEditorComponent, MaterialModule, UpsertEntityComponent } from '../../../../@shared'
import { KnowledgebaseListComponent, ToolsetListComponent } from '../../../../@shared/copilot'
import { XpertToolsetsComponent } from '../toolsets/toolsets.component'

@Component({
  standalone: true,
  selector: 'pac-settings-xpert-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
  imports: [
    RouterModule,
    TranslateModule,
    MaterialModule,
    CdkListboxModule,
    FormsModule,
    ContentLoaderModule,
    FormlyModule,
    ReactiveFormsModule,
    NgmCommonModule,
    AvatarEditorComponent,
    KnowledgebaseListComponent,
    ToolsetListComponent
  ]
})
export class XpertToolsetComponent extends UpsertEntityComponent<IXpertToolset> {
  DisplayBehaviour = DisplayBehaviour

  readonly toolsetService = inject(XpertToolsetService)
  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly toolsetsComponent = inject(XpertToolsetsComponent)
  readonly #toastr = inject(ToastrService)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #translate = inject(TranslateService)
  readonly dialog = inject(MatDialog)
  readonly fb = inject(FormBuilder)
  readonly paramId = injectParams('id')

  readonly loading = signal(true)
  readonly toolset = signal<IXpertToolset>(null)

  readonly formGroup = this.fb.group({
    id: new FormControl<string>(null),
    avatar: new FormControl<TAvatar>(null),
    name: new FormControl<string>(null),
    description: new FormControl<string>(null),
    type: new FormControl<string>(null),
    options: new FormGroup({}),
    tools: new FormControl(null),
  })

  readonly type = toSignal(this.formGroup.get('type').valueChanges)
  optionsModel = {}
  formOptions = {}
  get optionsForm() {
    return this.formGroup.get('options') as FormGroup
  }

  readonly types = signal(
    Array.from(TOOLSET_TYPES.values()).map((type) => ({
      key: type.name,
      caption: type.description
    }))
  )

  readonly i18n = toSignal(this.#translate.stream('PAC.Xpert.Toolset'))
  readonly toolsetType = computed(() => {
    const type = this.type()
    return type ? TOOLSET_TYPES.get(type) : null
  })
  readonly schema = computed(() => {
    const toolsetType = this.toolsetType()
    if (!toolsetType) {
      return null
    }
    return convertConfigurationSchema(toolsetType.schema, this.i18n())
  })
  readonly toolsetTypeAvatar = computed(() => this.toolsetType()?.avatar)
  readonly toolsetTypeTools = computed(() => this.toolsetType()?.tools)

  private toolsetSub = toObservable(this.paramId)
    .pipe(
      distinctUntilChanged(),
      filter(nonBlank),
      switchMap((id) => this.toolsetService.getById(id, { relations: ['tools'] })),
      takeUntilDestroyed()
    )
    .subscribe((role) => {
      this.toolset.set(role)
    })

  constructor(toolsetService: XpertToolsetService) {
    super(toolsetService)

    effect(
      () => {
        if (this.toolset()) {
          this.formGroup.patchValue({
            ...this.toolset(),
          })

          assign(this.optionsModel, this.toolset().options)
        } else {
          this.formGroup.reset()
        }
        this.formGroup.markAsPristine()
        this.loading.set(false)
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      if (this.toolsetTypeAvatar() && !this.formGroup.value.avatar) {
        this.formGroup.patchValue({
          avatar: this.toolsetTypeAvatar()
        })
      }
    },
    { allowSignalWrites: true }
    )

    effect(() => {
      if (this.toolsetTypeTools() && !this.formGroup.value.tools) {
        this.formGroup.patchValue({
          tools: this.toolsetTypeTools()
        })
      }
    },
    { allowSignalWrites: true }
    )
  }

  saveAll() {
    const entity = {
      ...this.formGroup.value,
      category: this.toolsetType()?.category
    }

    this.upsert(entity).subscribe({
      next: () => {
        this.formGroup.markAsPristine()
        this.close(true)
      },
      error: (error) => {
        // this.#toastr.error(getErrorMessage(error))
      }
    })
  }

  cancel() {
    this.close()
  }

  close(refresh = false) {
    if (refresh) {
      this.toolsetsComponent.refresh()
    }
    this.#router.navigate(['../'], { relativeTo: this.#route })
  }
}
