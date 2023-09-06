import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DensityDirective, DisplayDensity } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { DataSourceService } from '@metad/cloud/state'
import { uuid } from '@metad/story/core'
import { NgxPopperjsModule, NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import { firstValueFrom } from 'rxjs'
import { CopilotService } from '../../../@core'
import { MaterialModule } from '../../material.module'
import { CopilotChatComponent } from '../chat/chat.component'
import { CopilotGlobalService } from './global.service'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-copilot-global',
  templateUrl: 'global.component.html',
  styleUrls: ['global.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    NgxPopperjsModule,
    DensityDirective,

    CopilotChatComponent
  ],
  host: {
    class: 'pac-copilot-global'
  }
})
export class CopilotGlobalComponent {
  NgxPopperjsPlacements = NgxPopperjsPlacements
  NgxPopperjsTriggers = NgxPopperjsTriggers
  private copilotService = inject(CopilotService)
  public copilotGlobalService = inject(CopilotGlobalService)
  private dataSourceService = inject(DataSourceService)

  @Input() displayDensity: DisplayDensity | string

  // getGrounding() {
  //   return async (prompt: string): Promise<CopilotChatMessage[]> => {
  //     console.log(prompt)
  //     return await this.copilotGlobalService.copilotEngine.process(prompt)
  //       const choices = await this.copilotService1.createChat([{
  //         role: CopilotChatMessageRoleEnum.System,
  //         content: `给定以下预设条件：
  // 命令：创建故事(CreateStory)，创建模型(CreateModel)，创建指标(CreateIndicator)
  // 请指出问题中涉及到的 command，不用给出额外属性。
  // 例如
  // 问题：使用AdventureWorks: 销售模型构建一个故事仪表板
  // 答案：{
  //   "command": "CreateStory"
  // }`}, {
  //         role: CopilotChatMessageRoleEnum.User,
  //         content: `问题：${prompt}
  // 答案：`
  //       }])

  //       try {
  //         const res: GroundingResult = JSON.parse(choices[0].message.content)
  //         return await this.preprocess({
  //           originPrompt: prompt,
  //           ...res
  //         })
  //       } catch(err) {
  //       }

  //       return prompt
  //   }
  // }

  // async preprocess(gp: GroundingResult) {
  //   if (gp.command === 'CreateModel') {
  //     const prompt = await this.prepareCreateModelPrompt(gp.originPrompt)
  //     return prompt
  //   }

  //   return gp.originPrompt
  // }

  async prepareCreateModelPrompt(originPrompt: string) {
    const dataSources = await firstValueFrom(this.dataSourceService.getAll(['type']))
    console.log(dataSources)
    const mock = {
      id: uuid(),
      name: '系统数据源'
    }

    return `给定以下数据源列表：${JSON.stringify([
      mock,
      ...dataSources.map((item) => ({
        id: item.id,
        name: item.name
      }))
    ])}
请指出问题中涉及到的数据源。
例如
问题：从系统数据源创建一个语义模型
答案："${mock.id}"
请回答
问题：${originPrompt}
答案：`
  }
}
