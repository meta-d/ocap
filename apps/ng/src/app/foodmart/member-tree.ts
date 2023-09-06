import { TreeControlOptions } from '@metad/ocap-angular/controls'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'

export const MemberTrees = [
  {
    title: 'MemberTreeSelect: Store',
    type: 'MemberTreeSelect',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales'
    },
    dimension: {
      dimension: '[Store]',
      displayBehaviour: DisplayBehaviour.descriptionAndId
    },
    appearance: {
      displayDensity: DisplayDensity.cosy,
      color: 'accent'
    },
    options: {
      virtualScroll: true,
      initalLevel: 1,
      defaultMembers: [{ value: '[Canada]' }]
    }
  },
  {
    type: 'MemberTreeSelect',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales'
    },
    dimension: {
      dimension: '[Time]'
    },
    options: {
      searchable: true
    }
  },
  {
    type: 'TreeSelect',
    options: {
      treeViewer: true,
      searchable: true
    },
    treeNodes: [
      {
        key: '1',
        caption: '1',
        raw: {},
        children: [
          {
            key: '1.1',
            caption: '1.1',
            raw: {},
          },
          {
            key: '1.2',
            caption: '1.2',
            raw: {},
          }
        ]
      }
    ]
  },
  {
    type: 'MemberTree',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales'
    },
    dimension: {
      dimension: '[Product]'
    },
    options: {
      searchable: true,
      defaultMembers: [
        {
          value: '[ADJ]'
        }
      ]
    } as TreeControlOptions
  }
]
