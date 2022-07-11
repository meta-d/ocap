import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DisplayDensity, NgmMissingTranslationHandler, OcapCoreModule } from '@metad/ocap-angular/core'
import { DisplayBehaviour, TreeNodeInterface } from '@metad/ocap-core'
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { TreeSelectComponent } from './tree-select.component'
import { TreeSelectModule } from './tree-select.module'

@Component({
  selector: 'test-tree-select',
  template: `<ngm-tree-select [label]="label" [treeNodes]="treeNodes" [placeholder]="'Please Select ' + label"
    [multiple]="multiple"
    [autocomplete]="autocomplete"
    [virtualScroll]="virtualScroll"
    [displayBehaviour]="displayBehaviour"
    [displayDensity]="displayDensity"
    [treeViewer]="treeViewer"
    [searchable]="searchable"
    [color]="color"
    [ngModel]="model"
    (ngModelChange)="onModelChange($event)">
  </ngm-tree-select>`
})
class TestTreeSelectComponent<T> {
  
  @Input() label: string
  @Input() placeholder: string
  @Input() treeNodes: TreeNodeInterface<T>
  @Input() multiple: boolean
  @Input() autocomplete: boolean
  @Input() virtualScroll: boolean
  @Input() treeViewer: boolean
  @Input() searchable: boolean
  @Input() color: string
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity | string
  @Input() model = null

  onModelChange(event) {
    console.warn(event)
  }
}

export default {
  title: 'TreeSelectComponent',
  component: TreeSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          missingTranslationHandler: {
            provide: MissingTranslationHandler,
            useClass: NgmMissingTranslationHandler
          }
        }),
        TreeSelectModule,
        OcapCoreModule
      ],
      declarations: [TestTreeSelectComponent]
    })
  ]
} as Meta<TreeSelectComponent<unknown>>

const TREE_NODE_DATA = [
  {
    key: 'Fruit',
    label: '水果',
    children: [
      { key: 'Apple', label: '苹果', value: 10, raw: { type: 'Hive' } },
      { key: 'Banana', label: '香蕉', value: 20 },
      { key: 'Fruit loops', label: '果循环', value: 30 }
    ]
  },
  {
    key: 'Vegetables',
    label: '蔬菜',
    children: [
      {
        key: 'Green',
        label: '绿色',
        children: [
          { key: 'Broccoli', label: '西兰花', value: 10 },
          { key: 'Brussel sprouts', label: '豆芽', value: 20 }
        ]
      },
      {
        key: 'Orange',
        label: '橙',
        children: [
          { key: 'Pumpkins', label: '南瓜', value: 30, raw: { type: 'PG' } },
          { key: 'Carrots', label: '胡萝卜', value: 40 }
        ]
      }
    ]
  }
] as any

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `<test-tree-select [label]="label" [treeNodes]="treeNodes" [model]="model" [multiple]="multiple"
    [autocomplete]="autocomplete" [virtualScroll]="virtualScroll"
    [displayBehaviour]="displayBehaviour" [displayDensity]="displayDensity" [treeViewer]="treeViewer"
    [searchable]="searchable"
    [color]="color"></test-tree-select>`,
  styles: [``]
})

export const ATreeSelect = Template.bind({})
ATreeSelect.args = {
  treeNodes: TREE_NODE_DATA,
  model: 'Apple'
}

export const BTreeSelectMultiple = Template.bind({})
BTreeSelectMultiple.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  model: ['Fruit', 'Apple']
}

export const CAutocomplete = Template.bind({})
CAutocomplete.args = {
  label: 'AutoComplete',
  treeNodes: TREE_NODE_DATA,
  autocomplete: true,
  model: 'Apple'
}

export const DAutocompleteMultiple = Template.bind({})
DAutocompleteMultiple.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  autocomplete: true,
  model: ['Fruit', 'Apple']
}

export const EAutocompleteVirtualScroll = Template.bind({})
EAutocompleteVirtualScroll.args = {
  label: 'AutoComplete',
  treeNodes: TREE_NODE_DATA,
  autocomplete: true,
  virtualScroll: true,
  model: 'Apple'
}

export const FAutocompleteMultipleVirtualScroll = Template.bind({})
FAutocompleteMultipleVirtualScroll.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  autocomplete: true,
  virtualScroll: true,
  model: ['Fruit', 'Apple']
}

export const GTreeSelectDisplayBehaviour = Template.bind({})
GTreeSelectDisplayBehaviour.args = {
  treeNodes: TREE_NODE_DATA,
  displayBehaviour: DisplayBehaviour.descriptionAndId,
  model: 'Apple'
}

export const HTreeSelectMultipleBehaviour = Template.bind({})
HTreeSelectMultipleBehaviour.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  displayBehaviour: DisplayBehaviour.descriptionAndId,
  model: ['Fruit', 'Apple']
}

export const IAutocompleteDisplayBehaviour = Template.bind({})
IAutocompleteDisplayBehaviour.args = {
  label: 'Autocomplete & DisplayBehaviour',
  treeNodes: TREE_NODE_DATA,
  autocomplete: true,
  displayBehaviour: DisplayBehaviour.descriptionAndId,
  model: 'Apple'
}

export const JAutocompleteMultipleBehaviour = Template.bind({})
JAutocompleteMultipleBehaviour.args = {
  treeNodes: TREE_NODE_DATA,
  autocomplete: true,
  multiple: true,
  displayBehaviour: DisplayBehaviour.descriptionAndId,
  model: ['Fruit', 'Apple']
}

export const ATreeSelectDensityCosy = Template.bind({})
ATreeSelectDensityCosy.args = {
  label: 'TreeSelect Density',
  treeNodes: TREE_NODE_DATA,
  displayDensity: DisplayDensity.cosy,
  model: 'Apple'
}

export const CAutocompleteDensityCosy = Template.bind({})
CAutocompleteDensityCosy.args = {
  label: 'AutoComplete Density',
  treeNodes: TREE_NODE_DATA,
  autocomplete: true,
  displayDensity: DisplayDensity.cosy,
  model: 'Apple'
}

export const ATreeSelectDensityCompact = Template.bind({})
ATreeSelectDensityCompact.args = {
  label: 'TreeSelect Density',
  treeNodes: TREE_NODE_DATA,
  displayDensity: DisplayDensity.compact,
  model: 'Apple'
}

export const CAutocompleteDensityCompact = Template.bind({})
CAutocompleteDensityCompact.args = {
  label: 'AutoComplete Density',
  treeNodes: TREE_NODE_DATA,
  autocomplete: true,
  displayDensity: DisplayDensity.compact,
  model: 'Apple'
}

export const BTreeSelectMultipleDensityCompact = Template.bind({})
BTreeSelectMultipleDensityCompact.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  displayDensity: DisplayDensity.compact,
  model: ['Fruit', 'Apple']
}

export const KTreeViewer = Template.bind({})
KTreeViewer.args = {
  treeNodes: TREE_NODE_DATA,
  treeViewer: true,
  model: 'Fruit'
}

export const KTreeViewerCompact = Template.bind({})
KTreeViewerCompact.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  displayDensity: DisplayDensity.compact,
  treeViewer: true,
  model: ['Fruit', 'Apple']
}

export const KTreeViewerColorAccent = Template.bind({})
KTreeViewerColorAccent.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  treeViewer: true,
  color: 'accent',
  model: ['Fruit', 'Apple']
}

export const KTreeViewerColorPrimary = Template.bind({})
KTreeViewerColorPrimary.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  treeViewer: true,
  color: 'primary',
  model: ['Fruit', 'Apple']
}

export const KTreeViewerSearchable = Template.bind({})
KTreeViewerSearchable.args = {
  treeNodes: TREE_NODE_DATA,
  multiple: true,
  treeViewer: true,
  searchable: true,
  model: ['Fruit', 'Apple']
}
