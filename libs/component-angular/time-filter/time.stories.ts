import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NxCoreModule } from '@metad/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { NxTimeFilterEditorComponent } from './time-filter-editor/time-filter-editor.component'
import { NxTimeFilterModule } from './time-filter.module'

export default {
  title: 'Components/Timer Filter',
  component: NxTimeFilterEditorComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [BrowserAnimationsModule, NxCoreModule.forRoot(), NxTimeFilterModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            dataSettings: {},
            slicer: {}
          }
        }
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
Default.args = {}
