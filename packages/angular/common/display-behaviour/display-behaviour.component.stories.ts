import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { DisplayBehaviourComponent } from './display-behaviour.component'
import { DisplayBehaviour } from '@metad/ocap-core'

export default {
  title: 'DisplayBehaviourComponent',
  component: DisplayBehaviourComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<DisplayBehaviourComponent>;

const Template: Story<DisplayBehaviourComponent> = (args: DisplayBehaviourComponent) => ({
  props: args,
});

export const Primary = Template.bind({})
Primary.args = {
  option: {
    value: 1,
    label: 'A'
  }
}

export const DescriptionAndId = Template.bind({})
DescriptionAndId.args = {
  option: {
    value: 1,
    label: 'A'
  },
  displayBehaviour: DisplayBehaviour.descriptionAndId
}
