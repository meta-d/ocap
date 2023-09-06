export const MemberLists = [
  {
    type: 'MemberList',
    title: 'Member List: single selection',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales'
    },
    dimension: {
      dimension: '[Store]'
    },
    options: {
      searchable: true,

    },
    slicer: {
      members: [
        {
          value: '[USA]'
        }
      ]
    }
  },
  {
    type: 'MemberList',
    title: 'Member List: mutiple selection',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales'
    },
    dimension: {
      dimension: '[Store]'
    },
    options: {
      multiple: true,
      searchable: true,
      defaultMembers: [
        {
          value: '[USA]'
        }
      ]
    }
  },
  {
    type: 'MemberList',
    title: 'Member List: radio group',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales'
    },
    dimension: {
      dimension: '[Store]'
    },
    options: {
      searchable: true,
      radio: true,
      defaultMembers: [
        {
          value: '[USA]'
        }
      ]
    }
  }
]
