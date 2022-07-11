import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DisplayDensity, OcapCoreModule } from '@metad/ocap-angular/core'
import { DisplayBehaviour, TreeNodeInterface } from '@metad/ocap-core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { SelectComponent } from './select.component'
import { SelectModule } from './select.module'

@Component({
  selector: 'test-select',
  template: `<ngm-select
    [label]="label"
    [placeholder]="'Please Select ' + label"
    [selectOptions]="selectOptions"
    [multiple]="multiple"
    [autocomplete]="autocomplete"
    [virtualScroll]="virtualScroll"
    [displayBehaviour]="displayBehaviour"
    [displayDensity]="displayDensity"
    [treeViewer]="treeViewer"
    [color]="color"
    [ngModel]="model"
    (ngModelChange)="onModelChange($event)"
  >
  </ngm-select>`
})
class TestSelectComponent<T> {
  @Input() label: string
  @Input() placeholder: string
  @Input() selectOptions: TreeNodeInterface<T>
  @Input() multiple: boolean
  @Input() autocomplete: boolean
  @Input() virtualScroll: boolean
  @Input() treeViewer: boolean
  @Input() color: string
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity | string
  @Input() model = null

  onModelChange(event) {
    console.warn(event)
  }
}

export default {
  title: 'SelectComponent',
  component: SelectComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, SelectModule, OcapCoreModule],
      declarations: [TestSelectComponent]
    })
  ]
} as Meta<SelectComponent>

const TREE_NODE_DATA = [
  {
    value: 'Fruit',
    label: '水果'
  },
  { value: 'Apple', label: '苹果', raw: { type: 'Hive' } },
  { value: 'Banana', label: '香蕉' },
  { value: 'Fruit loops', label: '果循环' },
  {
    value: 'Vegetables',
    label: '蔬菜'
  },
  {
    value: 'Green',
    label: '绿色'
  },
  { value: 'Broccoli', label: '西兰花' },
  { value: 'Brussel sprouts', label: '豆芽' },
  {
    value: 'Orange',
    label: '橙'
  },
  { value: 'Pumpkins', label: '南瓜', raw: { type: 'PG' } },
  { value: 'Carrots', label: '胡萝卜' }
] as any

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `<test-select [label]="label" [selectOptions]="selectOptions" [model]="model" [multiple]="multiple" [autocomplete]="autocomplete" [virtualScroll]="virtualScroll"
  [displayBehaviour]="displayBehaviour" [displayDensity]="displayDensity" [treeViewer]="treeViewer"
  [color]="color"></test-select>`,
  styles: [``]
})

export const ASelect = Template.bind({})
ASelect.args = {
  selectOptions: TREE_NODE_DATA,
  model: 'Apple'
}

export const BSelectMultiple = Template.bind({})
BSelectMultiple.args = {
  selectOptions: TREE_NODE_DATA,
  multiple: true,
  model: ['Apple', 'Pumpkins']
}

export const CSelectVirtualScroll = Template.bind({})
CSelectVirtualScroll.args = {
  selectOptions: TREE_NODE_DATA,
  multiple: true,
  virtualScroll: true,
  model: ['Apple', 'Pumpkins']
}

export const DSelectDisplayBehaviour = Template.bind({})
DSelectDisplayBehaviour.args = {
  selectOptions: TREE_NODE_DATA,
  model: 'Apple',
  displayBehaviour: DisplayBehaviour.descriptionAndId
}

export const ESelectDisplayDensity = Template.bind({})
ESelectDisplayDensity.args = {
  selectOptions: TREE_NODE_DATA,
  model: 'Apple',
  displayDensity: DisplayDensity.compact
}
