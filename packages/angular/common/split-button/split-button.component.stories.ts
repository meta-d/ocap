import { CommonModule } from '@angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { SplitButtonComponent } from './split-button.component'
import { SplitButtonModule } from './split-button.module'

export default {
  title: 'SplitButtonComponent',
  component: SplitButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, SplitButtonModule, OcapCoreModule],
      declarations: []
    })
  ]
} as Meta<SplitButtonComponent>

const Template: Story<SplitButtonComponent> = (args: SplitButtonComponent) => ({
  props: args,
  styles: [``]
})

export const SplitButton = Template.bind({})
SplitButton.args = {}
