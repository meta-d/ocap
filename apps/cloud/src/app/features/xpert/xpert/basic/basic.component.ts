import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DensityDirective } from '@metad/ocap-angular/core'
import { ICopilotModel, IfAnimation, IXpert, ModelType, XpertTypeEnum } from 'apps/cloud/src/app/@core'
import { CopilotModelSelectComponent, MaterialModule } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { pick } from 'lodash-es'
import { XpertStudioApiService } from '../../studio/domain'
import { XpertBasicFormComponent } from '../basic-form/basic.component'

@Component({
  selector: 'xpert-basic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkMenuModule,
    MaterialModule,
    DensityDirective,

    EmojiAvatarComponent,
    CopilotModelSelectComponent,
    XpertBasicFormComponent
  ],
  templateUrl: './basic.component.html',
  styleUrl: './basic.component.scss',
  animations: [IfAnimation]
})
export class XpertBasicComponent {
  eXpertTypeEnum = XpertTypeEnum
  eModelType = ModelType

  readonly apiService = inject(XpertStudioApiService)

  readonly xpert = input<IXpert>()

  readonly avatar = computed(() => this.xpert().avatar)

  readonly copilotModel = model<ICopilotModel>()

  readonly isExpanded = model<boolean>(false)
  readonly basic = model<Partial<IXpert>>()

  constructor() {
    effect(
      () => {
        if (this.xpert()) {
          this.copilotModel.set(this.xpert()?.copilotModel)
          this.basic.set(pick(this.xpert(), 'name', 'title', 'description', 'avatar', 'tags'))
        }
      },
      { allowSignalWrites: true }
    )
  }

  udpateXpert() {
    this.apiService.updateXpert({
      ...this.basic(),
      copilotModel: this.copilotModel()
    })
  }

  toggleExpand() {
    this.isExpanded.update((state) => !state)
  }
}
