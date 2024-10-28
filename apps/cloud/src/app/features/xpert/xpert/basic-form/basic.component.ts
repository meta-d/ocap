import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IXpert, ModelType, TagCategoryEnum, XpertTypeEnum } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor'
import { XpertStudioApiService } from '../../studio/domain'
import { TagSelectComponent } from 'apps/cloud/src/app/@shared'

@Component({
  selector: 'xpert-basic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, EmojiAvatarComponent, TagSelectComponent],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss',
  hostDirectives: [NgxControlValueAccessor]
})
export class XpertBasicFormComponent {
  eXpertTypeEnum = XpertTypeEnum
  eModelType = ModelType
  eTagCategoryEnum = TagCategoryEnum

  readonly apiService = inject(XpertStudioApiService)
  protected cva = inject<NgxControlValueAccessor<Partial<IXpert> | null>>(NgxControlValueAccessor)

  get avatar() {
    return this.cva.value?.avatar
  }
  set avatar(value) {
    this.cva.value = {
      ...(this.cva.value ?? {}),
      avatar: value
    }
  }

  get name() {
    return this.cva.value?.name
  }

  get title() {
    return this.cva.value?.title
  }
  set title(value) {
    this.cva.value = {
      ...(this.cva.value ?? {}),
      title: value
    }
  }

  get description() {
    return this.cva.value?.description
  }
  set description(value) {
    this.cva.value = {
      ...(this.cva.value ?? {}),
      description: value
    }
  }

  get tags() {
    return this.cva.value?.tags
  }
  set tags(value) {
    this.cva.value = {
      ...(this.cva.value ?? {}),
      tags: value
    }
    console.log(value)
  }
}
