import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Meta, moduleMetadata } from '@storybook/angular'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { NgmCompareMemberSelectComponent } from './member-select.component'

export default {
  title: 'Entity/CompareMemberSelect',
  component: NgmCompareMemberSelectComponent,
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG
        }),
        MonacoEditorModule.forRoot(),
      ]
    })
  ]
} as Meta

export const Primary = () => ({
  component: NgmCompareMemberSelectComponent,
  props: {
    label: 'Dimension',
    dimension: {
      dimension: '[Department]'
    },
    
  }
})

export const Calendar = () => ({
  component: NgmCompareMemberSelectComponent,
  props: {
    label: 'Dimension',
    dimension: {
      dimension: '[ZCALMONTH]'
    }
  }
})
