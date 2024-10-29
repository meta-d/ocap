import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, effect, inject, model, signal } from '@angular/core'
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DensityDirective } from '@metad/ocap-angular/core'
import {
  getErrorMessage,
  IfAnimation,
  ModelType,
  omitXpertRelations,
  TagCategoryEnum,
  ToastrService,
  TXpertTeamDraft,
  XpertService,
  XpertTypeEnum
} from 'apps/cloud/src/app/@core'
import { CopilotModelSelectComponent, MaterialModule, TagSelectComponent } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertComponent } from '../xpert.component'

@Component({
  selector: 'xpert-basic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkMenuModule,
    MaterialModule,
    DensityDirective,

    EmojiAvatarComponent,
    CopilotModelSelectComponent,
    TagSelectComponent
  ],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss',
  animations: [IfAnimation]
})
export class XpertBasicComponent {
  eXpertTypeEnum = XpertTypeEnum
  eModelType = ModelType
  eTagCategoryEnum = TagCategoryEnum

  readonly xpertComponent = inject(XpertComponent)
  readonly xpertService = inject(XpertService)
  readonly #fb = inject(FormBuilder)
  readonly #toastr = inject(ToastrService)

  readonly xpertId = this.xpertComponent.paramId
  readonly xpert = this.xpertComponent.xpert
  readonly draft = this.xpertComponent.draft

  readonly isExpanded = model<boolean>(false)

  readonly form = this.#fb.group({
    name: this.#fb.control(null),
    title: this.#fb.control(null),
    description: this.#fb.control(null),
    avatar: this.#fb.control(null),
    tags: this.#fb.control(null),
    copilotModel: this.#fb.control(null)
  })
  get name() {
    return this.form.get('name').value
  }
  get avatar() {
    return this.form.get('avatar') as FormControl
  }
  get title() {
    return this.form.get('title') as FormControl
  }
  get description() {
    return this.form.get('description') as FormControl
  }
  get tags() {
    return this.form.get('tags') as FormControl
  }

  get copilotModel() {
    return this.form.get('copilotModel') as FormControl
  }

  readonly loading = signal(false)

  constructor() {
    effect(
      () => {
        if (this.xpert()) {
          this.form.patchValue(this.xpert())
          this.form.markAsPristine()
        }
      },
      { allowSignalWrites: true }
    )
  }

  toggleExpand() {
    this.isExpanded.update((state) => !state)
  }

  saveDraft() {
    this.loading.set(true)
    this.xpertService
      .update(this.xpertId(), {
        draft: {
          ...(this.draft() ?? {}),
          team: {
            ...omitXpertRelations(this.xpert()),
            ...(this.draft()?.team ?? {}),
            ...this.form.value
          }
        } as TXpertTeamDraft
      })
      .subscribe({
        next: (value) => {
          this.#toastr.success('PAC.Messages.SavedDraft', { Default: 'Saved draft!' })
          this.loading.set(false)
          this.form.markAsPristine()
          this.xpertComponent.refresh()
        },
        error: (err) => {
          this.loading.set(false)
          this.#toastr.error(getErrorMessage(err))
        }
      })
  }
}
