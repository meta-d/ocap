import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NxCoreModule } from '@metad/core'
import { Meta, moduleMetadata } from '@storybook/angular'
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { PropertyModule } from '../property.module'
import { PropertyMemberSelectComponent } from './member-select.component'

export default {
  title: 'Components/Property/Member Select',
  component: PropertyMemberSelectComponent,
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG
        }),
        PropertyModule,
        MonacoEditorModule.forRoot(),
        NxCoreModule.forRoot(),
      ]
    })
  ]
} as Meta

export const Primary = () => ({
  component: PropertyMemberSelectComponent,
  props: {
    label: 'Dimension',
    dimension: {
      dimension: '[Department]'
    },
    
  }
})

export const Calendar = () => ({
  component: PropertyMemberSelectComponent,
  props: {
    label: 'Dimension',
    dimension: {
      dimension: '[ZCALMONTH]'
    }
  }
})
