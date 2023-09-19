import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { IgxActionStripComponent } from './action-strip.component'
import { NxActionStripModule } from './action-strip.module'

export default {
  title: 'Components/ActionStrip',
  component: IgxActionStripComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [BrowserAnimationsModule, MatIconModule, MatButtonModule, NxActionStripModule]
    })
  ]
} as Meta

const Template: Story<IgxActionStripComponent> = (args) => ({
  template: `<ngm-action-strip>
  <button mat-icon-button><mat-icon>done</mat-icon></button>
</ngm-action-strip>`,
  props: {
    ...args
  }
})

export const Horizontal = Template.bind({})
Horizontal.args = {}

export const Vertical = Template.bind({})
Vertical.args = {}
