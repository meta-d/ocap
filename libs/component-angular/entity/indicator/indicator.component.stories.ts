import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { NxEntityModule } from '../entity.module'
import { IndicatorComponent } from './indicator.component'
import { DisplayBehaviour } from '@metad/ocap-core'
import { uuid } from '@metad/components/core'

export default {
  title: 'Components/Entity/Indicator',
  component: IndicatorComponent,
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG
        }),

        NxEntityModule
      ]
    })
  ]
} as Meta

const Template: Story = (args) => ({
  props: {
    ...args
  }
})

export const Default = Template.bind({})
Default.args = {
  indicator: {
    id: uuid(),
    code: 'FIN0001',
    name: '公司总收入'
  },
  displayBehaviour: DisplayBehaviour.descriptionAndId
}
