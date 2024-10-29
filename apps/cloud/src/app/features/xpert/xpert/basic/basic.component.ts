import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, effect, inject, model, signal } from '@angular/core'
import { AbstractControl, FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  getErrorMessage,
  IfAnimation,
  ModelType,
  omitXpertRelations,
  TagCategoryEnum,
  ToastrService,
  TXpertParameter,
  TXpertTeamDraft,
  XpertParameterTypeEnum,
  XpertService,
  XpertTypeEnum
} from 'apps/cloud/src/app/@core'
import { CopilotModelSelectComponent, MaterialModule, TagSelectComponent } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertComponent } from '../xpert.component'
import { TranslateModule } from '@ngx-translate/core'
import { NgmInputComponent } from '@metad/ocap-angular/common'
import { NgmDensityDirective } from '@metad/ocap-angular/core'
import { NgxFloatUiModule, NgxFloatUiTriggers } from 'ngx-float-ui'
import { CdkListboxModule } from '@angular/cdk/listbox'
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop'

@Component({
  selector: 'xpert-basic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CdkMenuModule,
    CdkListboxModule,
    DragDropModule,
    MaterialModule,
    NgxFloatUiModule,

    NgmDensityDirective,
    EmojiAvatarComponent,
    CopilotModelSelectComponent,
    TagSelectComponent,
    NgmInputComponent
  ],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss',
  animations: [IfAnimation]
})
export class XpertBasicComponent {
  eXpertTypeEnum = XpertTypeEnum
  eModelType = ModelType
  eTagCategoryEnum = TagCategoryEnum
  eNgxFloatUiTriggers = NgxFloatUiTriggers
  eXpertParameterTypeEnum = XpertParameterTypeEnum

  readonly xpertComponent = inject(XpertComponent)
  readonly xpertService = inject(XpertService)
  readonly #fb = inject(FormBuilder)
  readonly #toastr = inject(ToastrService)
  readonly #cdr = inject(ChangeDetectorRef)

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
    copilotModel: this.#fb.control(null),
    starters: this.#fb.array([
      this.#fb.control(null),
      this.#fb.control(null),
      this.#fb.control(null),
      this.#fb.control(null),
    ]),
    // parameters: this.#fb.array([])
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
  get starters() {
    return this.form.get('starters') as FormArray
  }
  // get parameters() {
  //   return this.form.get('parameters') as FormArray
  // }

  readonly loading = signal(false)

  private valueSub = this.form.valueChanges.subscribe((value) => {
    console.log(value)
  })

  constructor() {
    effect(
      () => {
        if (this.xpert()) {
          this.form.patchValue(this.xpert())
          // this.initParameters(this.xpert().agent.parameters)
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

  // initParameters(values: TXpertParameter[]) {
  //   this.parameters.clear()
  //   values?.forEach((p) => {
  //     this.addParameter(p)
  //   })
  // }

  // addParameter(param: Partial<TXpertParameter>) {
  //   this.parameters.push(
  //     this.#fb.group({
  //       type: this.#fb.control(param.type),
  //       key: this.#fb.control(param.key),
  //       name: this.#fb.control(param.name),
  //       description: this.#fb.control(param.description),
  //       optional: this.#fb.control(param.optional),
  //       maximum: this.#fb.control(param.maximum),
  //       options: this.#fb.control(param.options),
  //     })
  //   )
  // }

  // deleteParameter(i: number) {
  //   this.parameters.removeAt(i)
  // }

  // updateParameter(index: number, name: string, value: string) {
  //   this.parameters.at(index).get(name).setValue(value, {emitEvent: true})
  //   this.form.markAsDirty()
  // }

  // addOption(index: number) {
  //   const control = this.parameters.at(index)
  //   control.patchValue({
  //     options: [
  //       ...(control.value.options ?? []),
  //       ''
  //     ]
  //   })
  // }

  // setOption(index: number, j: number, value: string) {
  //   const control = this.parameters.at(index)
  //   control.value.options[j] = value
  //   control.patchValue({
  //     options: control.value.options
  //   })
  // }

  // deleteOption(index: number, j: number) {
  //   const control = this.parameters.at(index)
  //   control.value.options.splice(j)
  //   control.patchValue({
  //     options: control.value.options
  //   })
  // }

  // drop(index: number, event: CdkDragDrop<string, string>) {
  //   const control = this.parameters.at(index)
  //   moveItemInArray(control.value.options, event.previousIndex, event.currentIndex)
  //   control.patchValue({
  //     options: control.value.options
  //   })
  // }

}
