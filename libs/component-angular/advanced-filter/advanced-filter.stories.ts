import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { moduleMetadata, Story } from '@storybook/angular'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { NxAdvancedFilterComponent } from './advanced-filter.component'
import { NxAdvancedFilterModule } from './advanced-filter.module'


export default {
  title: 'Components/AdvancedFilter',
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG,
        }),
        NxAdvancedFilterModule,
        // NxCoreModule.forRoot(),
        // NxDSCoreModule.forRoot(),
        // NxDSMockModule.forRoot({
        //   '': {
        //     type: 'Mock',
        //     uri: '',
        //     settings: {
        //       dataSourceId: '123'
        //     }
        //   }
        // })
      ]
    })
  ],
  // parameters: {
  //   docs: {
  //     description: {
  //       component: `可选值列表,包括单列和 Tree 结构`,
  //     },
  //   },
  // },
}

const Template: Story<NxAdvancedFilterComponent> = (args) => ({
  template: `<div>&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&</div>`,
  props: {
    ...args
  }
})

export const Horizontal = Template.bind({})
Horizontal.args = {}

export const Vertical = Template.bind({})
Vertical.args = {}
