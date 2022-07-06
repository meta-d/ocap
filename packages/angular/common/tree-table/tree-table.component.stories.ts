import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DisplayDensity, OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { TreeTableComponent } from './tree-table.component'
import { TreeTableModule } from './tree-table.module'

export default {
  title: 'TreeTableComponent',
  component: TreeTableComponent,
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, TreeTableModule, OcapCoreModule]
    })
  ]
} as Meta<TreeTableComponent<unknown>>

const TREE_NODE_DATA = [
  {
    name: 'Fruit',
    children: [
      { name: 'Apple', value: 10, raw: { type: 'Hive' } },
      { name: 'Banana', value: 20 },
      { name: 'Fruit loops', value: 30 }
    ]
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          { name: 'Broccoli', value: 10 },
          { name: 'Brussel sprouts', value: 20 }
        ]
      },
      {
        name: 'Orange',
        children: [
          { name: 'Pumpkins', value: 30, raw: { type: 'PG' } },
          { name: 'Carrots', value: 40 }
        ]
      }
    ]
  }
] as any

const Template: Story<TreeTableComponent<unknown>> = (args: TreeTableComponent<unknown>) => ({
  props: args,
  styles: [``]
})

export const Primary = Template.bind({})
Primary.args = {
  data: TREE_NODE_DATA,
  columns: [
    {
      name: 'type',
      label: '类型'
    }
  ]
}

export const DensityCompact = Template.bind({})
DensityCompact.args = {
  data: TREE_NODE_DATA,
  columns: [
    {
      name: 'type',
      label: '类型'
    }
  ],
  displayDensity: DisplayDensity.compact
}

export const Striped = Template.bind({})
Striped.args = {
  data: TREE_NODE_DATA,
  columns: [
    {
      name: 'type',
      label: '类型'
    }
  ],
  displayDensity: DisplayDensity.compact,
  striped: true
}

export const Grid = Template.bind({})
Grid.args = {
  data: TREE_NODE_DATA,
  columns: [
    {
      name: 'type',
      label: '类型'
    }
  ],
  displayDensity: DisplayDensity.compact,
  grid: true
}
