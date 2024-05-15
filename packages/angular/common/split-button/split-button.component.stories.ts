import { CommonModule } from '@angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular'
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

type Story = StoryObj<SplitButtonComponent>

export const SplitButton: Story = {
  args: {
  },
};
