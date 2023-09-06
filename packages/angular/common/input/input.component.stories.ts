// Input.stories.ts

import { provideAnimations } from '@angular/platform-browser/animations'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular'
import { NgmInputComponent } from './input.component'

const meta: Meta<NgmInputComponent> = {
  component: NgmInputComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()]
    }),
    moduleMetadata({
      declarations: [],
      imports: [OcapCoreModule]
    })
  ]
}

export default meta
type Story = StoryObj<NgmInputComponent>

export const Primary: Story = {
  args: {}
}

export const DensityCosy: Story = {
  render: (args) => ({
    props: args,
    template: `<div displayDensity="cosy">
        <ngm-input [label]="label"></ngm-input>
</div>
`
  }),
  args: {}
}
