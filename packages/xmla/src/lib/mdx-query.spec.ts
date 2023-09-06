import {
  BaseProperty,
  C_MEASURES,
  Filter,
  FilterOperator,
  IFilter,
  IntrinsicMemberProperties,
  OrderDirection
} from '@metad/ocap-core'
import { DEPARTMENT_ENTITY_TYPE } from '../test/DATA'
import { mapMDXFilterToStatement, MDXHierarchyFilter } from './filter'
import { OrderFlag } from './functions'
import {
  allocateAxesFilter,
  allocateFilters,
  convertFilter2Hierarchy,
  convertOrderby,
  generateMDXQuery,
  getMDXProperty,
  uniteMDXProperty
} from './mdx-query'

describe('Generate MDX Query', () => {
  it('#convertFilter2Hierarchy', () => {
    // 向后兼容的设置维度的 level
    // expect(
    //   convertFilter2Hierarchy(DEPARTMENT_ENTITY_TYPE, {
    //     path: '[Department].[LEVEL]',
    //     operator: 'EQ',
    //     value: 0
    //   })
    // ).toEqual({
    //   defaultMember: '[Department].[All Departments]',
    //   level: '[Department].[(All)]',
    //   dimension: '[Department]',
    //   hierarchy: '[Department]'
    // })
    // 新的 ISlicer 类型以取代 NxIFilter
    // expect(convertFilter2Hierarchy(DEPARTMENT_ENTITY_TYPE, {
    //   dimension: {dimension: '[Department]'},
    //   members: [{
    //     value: 'A'
    //   }]
    // } as NxIFilter)).toEqual({
    //   defaultMember: "[Department].[All Departments]",
    //   level: "[Department].[(All)]",
    //   dimension: '[Department]',
    //   hierarchy: '[Department]',
    // })
  })

  it('#allocate Dimension and Filters', () => {
    expect(
      allocateFilters(
        [
          {
            dimension: '[Department]',
            hierarchy: '[Department]',
            level: '[Department].[Department Description]'
          }
        ],
        null,
        null,
        DEPARTMENT_ENTITY_TYPE,
        {}
      )
    ).toEqual({
      rows: [
        {
          dimension: '[Department]',
          hierarchy: '[Department]',
          level: '[Department].[Department Description]',
          statement: '[Department].[Department Description].Members',
          properties: []
        }
      ],
      slicers: []
    })
  })

  it('#Descendants', () => {
    expect(
      allocateFilters(
        [
          {
            dimension: '[Department]',
            hierarchy: '[Department]'
          }
        ],
        [],
        [
          convertFilter2Hierarchy(DEPARTMENT_ENTITY_TYPE, {
            dimension: {
              dimension: '[Department]'
            },
            operator: FilterOperator.EQ,
            members: [
              {
                value: '[ABC]'
              }
            ]
          } as IFilter)
        ],
        DEPARTMENT_ENTITY_TYPE,
        {}
      )
    ).toEqual({
      rows: [
        {
          dimension: '[Department]',
          hierarchy: '[Department]',
          statement: `{[Department].[ABC]}`,
          properties: ['LEVEL_NUMBER', 'CHILDREN_CARDINALITY']
        }
      ],
      columns: [],
      slicers: []
    })
  })

  // it('#allocate Filters and Orderbys', () => {
  //   expect(
  //     allocateFilters(
  //       [
  //         {
  //           dimension: '[Department]',
  //           hierarchy: '[Department]',
  //         },
  //       ],
  //       null,
  //       [
  //         {
  //           dimension: '[Department]',
  //           hierarchy: '[Department]',
  //           order: MDXOrderby.DESC,
  //         },
  //       ]
  //     )
  //   ).toEqual({
  //     rows: [
  //       {
  //         dimension: '[Department]',
  //         hierarchy: '[Department]',
  //         order: MDXOrderby.DESC,
  //         statement: 'Order({[Department].Members}, [Department].CurrentMember.Ordinal, DESC)'
  //       },
  //     ],
  //     slicers: [],
  //     orderbys: [],
  //   })
  // })

  it('#redistribute Dimensions and TopCount', () => {
    expect(
      allocateFilters(
        [
          {
            dimension: '[Department]',
            hierarchy: '[Department]'
          },
          {
            dimension: '[Customers]',
            hierarchy: '[Customers]'
          }
        ],
        [],
        [
          {
            dimension: '[Department]',
            hierarchy: '[Department]',
            operator: FilterOperator.NE,
            members: ['#']
          }
        ],
        DEPARTMENT_ENTITY_TYPE,
        {}
      )
    ).toEqual({
      rows: [
        {
          dimension: '[Department]',
          hierarchy: '[Department]',
          properties: ['LEVEL_NUMBER', 'CHILDREN_CARDINALITY'],
          statement: '{Except( [Department].Children, {[Department].[#]} )}'
        },
        {
          dimension: '[Customers]',
          hierarchy: '[Customers]',
          statement: '[Customers].Members',
          properties: []
        }
      ],
      columns: [],
      slicers: []
    })
  })

  it('#convertOrderby', () => {
    expect(convertOrderby(DEPARTMENT_ENTITY_TYPE, { order: OrderDirection.ASC, by: 'ZAMOUNT' })).toEqual({
      dimension: 'Measures',
      members: ['ZAMOUNT'],
      order: OrderFlag.ASC
    })

    expect(convertOrderby(DEPARTMENT_ENTITY_TYPE, { order: OrderDirection.DESC, by: 'ZAMOUNT' })).toEqual({
      dimension: 'Measures',
      members: ['ZAMOUNT'],
      order: OrderFlag.DESC
    })

    expect(convertOrderby(DEPARTMENT_ENTITY_TYPE, { order: OrderDirection.ASC, by: '[Department]' })).toEqual({
      allMember: '[Department].[All Departments]',
      defaultMember: '[Department].[All Departments]',
      dimension: '[Department]',
      hierarchy: '[Department]',
      order: OrderFlag.ASC
    } as any)

    expect(
      convertOrderby(DEPARTMENT_ENTITY_TYPE, { order: OrderDirection.ASC, by: '[Department].[Department Description]' })
    ).toEqual({
      defaultMember: '[Department].[All Departments]',
      dimension: '[Department]',
      hierarchy: '[Department]',
      level: '[Department].[Department Description]',
      order: OrderFlag.ASC
    } as any)
  })

  it('#generateMDXQuery', () => {
    expect(
      generateMDXQuery('HR', DEPARTMENT_ENTITY_TYPE, {
        selects: [{ dimension: '[Department]' }],
        filters: [new Filter({ dimension: '[Department]' }, [{ value: '财务' }], FilterOperator.Contains)]
      })
    ).toEqual({
      entity: 'HR',
      rows: [
        {
          allMember: '[Department].[All Departments]',
          defaultMember: '[Department].[All Departments]',
          hierarchy: '[Department]',
          dimension: '[Department]',
          statement: '{Filter( [Department], InStr( [Department].CURRENTMEMBER.MEMBER_CAPTION, "财务" ) > 0 )}',
          properties: ['LEVEL_NUMBER', 'CHILDREN_CARDINALITY']
        }
      ],
      slicers: [],
      columns: [],
      orderbys: [],
      conditions: [],
      advancedFilters: []
    })

    expect(
      generateMDXQuery('HR', DEPARTMENT_ENTITY_TYPE, {
        selects: [{ dimension: '[Department]' }, { dimension: C_MEASURES, measure: 'ZAMOUNT' } as BaseProperty]
      })
    ).toEqual({
      entity: 'HR',
      rows: [
        {
          allMember: '[Department].[All Departments]',
          defaultMember: '[Department].[All Departments]',
          hierarchy: '[Department]',
          dimension: '[Department]',
          statement: '[Department].[All Departments]',
          properties: []
        }
      ],
      columns: [
        {
          dimension: 'Measures',
          members: ['ZAMOUNT'],
          measure: 'ZAMOUNT'
        }
      ],
      slicers: [],
      conditions: [],
      advancedFilters: [],
      orderbys: []
    })
  })

  it('#generateMDXQuery with orderbys', () => {
    expect(
      generateMDXQuery('HR', DEPARTMENT_ENTITY_TYPE, {
        selects: [{ dimension: '[Department]' }, { dimension: C_MEASURES, measure: 'ZAMOUNT' } as BaseProperty],
        filters: [
          {
            dimension: {
              dimension: '[ZCALMONTH]',
              hierarchy: '[ZCALMONTH                     Z_H_MONTH_01]'
            },
            name: '[ZCALMONTH]',
            operator: FilterOperator.BT,
            members: [
              {
                value: '2020.02'
              },
              {
                value: '2021.02'
              }
            ]
          } as IFilter
        ],
        orderbys: [{ order: OrderDirection.DESC, by: 'ZAMOUNT' }]
      })
    ).toEqual({
      entity: 'HR',
      rows: [
        {
          allMember: '[Department].[All Departments]',
          defaultMember: '[Department].[All Departments]',
          hierarchy: '[Department]',
          dimension: '[Department]',
          statement: '[Department].[All Departments]',
          properties: []
        }
      ],
      columns: [
        {
          dimension: 'Measures',
          members: ['ZAMOUNT'],
          measure: 'ZAMOUNT'
        }
      ],
      slicers: [
        {
          dimension: '[ZCALMONTH]',
          hierarchy: '[ZCALMONTH                     Z_H_MONTH_01]',
          members: [
            {
              value: '2020.02'
            },
            {
              value: '2021.02'
            }
          ],
          operator: FilterOperator.BT
        }
      ],
      orderbys: [
        {
          dimension: 'Measures',
          members: ['ZAMOUNT'],
          order: OrderFlag.DESC
        }
      ],
      conditions: [],
      advancedFilters: []
    })
  })

  it('#mapHierarchyFilterToMDX', () => {
    const ftr: MDXHierarchyFilter = {
      dimension: '[Department]',
      hierarchy: '[Department]',
      operator: FilterOperator.EQ,
      members: ['ABC']
    }
    expect(mapMDXFilterToStatement(ftr, null, {})).toEqual(`{[Department].[ABC]}`)

    expect(
      mapMDXFilterToStatement({
        dimension: '[Department]',
        hierarchy: '[Department]',
        operator: FilterOperator.Contains,
        members: ['ABC'],
        properties: ['MEMBER_CAPTION']
      }, null, {})
    ).toEqual(`Filter( [Department], InStr( [Department].CURRENTMEMBER.MEMBER_CAPTION, "ABC" ) > 0 )`)
  })

  it('#displayHierarchy 应该显示维度为层级结构', () => {
    expect(
      generateMDXQuery('HR', DEPARTMENT_ENTITY_TYPE, {
        rows: [
          {
            dimension: '[Department]',
            displayHierarchy: true
          }
        ],
        columns: [{ dimension: C_MEASURES, measure: 'ZAMOUNT' } as BaseProperty]
      })
    ).toEqual({
      entity: 'HR',
      rows: [
        {
          dimension: '[Department]',
          hierarchy: '[Department]',
          displayHierarchy: true,
          statement: `Descendants( [Department].[All Departments], [Department].[Department Description], SELF_AND_BEFORE )`,
          properties: [IntrinsicMemberProperties.PARENT_UNIQUE_NAME, IntrinsicMemberProperties.CHILDREN_CARDINALITY],
          defaultMember: '[Department].[All Departments]',
          allMember: '[Department].[All Departments]'
        }
      ],
      columns: [{ dimension: 'Measures', measure: 'ZAMOUNT', members: ['ZAMOUNT'] }],
      conditions: [],
      advancedFilters: [],
      slicers: [],
      orderbys: []
    })
  })
})

describe('MDX Query with Time', () => {
  it('#MDX Query', () => {
    const query = generateMDXQuery(DEPARTMENT_ENTITY_TYPE.name, DEPARTMENT_ENTITY_TYPE, {
      rows: [
        {
          dimension: '[ZCALMONTH]'
        }
      ]
    })
    expect(query.rows[0]).toEqual(
      expect.objectContaining({
        statement: '[ZCALMONTH].Members'
      })
    )
  })
})

describe('Allocate Axes Filter', () => {
  it('#Basic', () => {
    expect(
      allocateAxesFilter(
        [
          {
            dimension: '[ZCALMONTH]',
            hierarchy: '[ZCALMONTH]'
          }
        ],
        [],
        DEPARTMENT_ENTITY_TYPE,
        {},
      )
    ).toEqual([
      {
        dimension: '[ZCALMONTH]',
        hierarchy: '[ZCALMONTH]',
        properties: [],
        statement: '[ZCALMONTH].Members'
      }
    ])
  })

  it('#No Hierarchy', () => {
    expect(
      allocateAxesFilter(
        [
          {
            dimension: '[ZCALMONTH]'
          }
        ],
        [],
        DEPARTMENT_ENTITY_TYPE,
        {}
      )
    ).toEqual([
      {
        dimension: '[ZCALMONTH]',
        properties: [],
        statement: '[ZCALMONTH].Members'
      }
    ])
  })

  it('#No Hierarchy but Default Member', () => {
    expect(
      allocateAxesFilter(
        [
          {
            dimension: '[Time]',
            defaultMember: '[Time].[All Time]'
          }
        ],
        [],
        DEPARTMENT_ENTITY_TYPE,
        {}
      )
    ).toEqual([
      {
        defaultMember: '[Time].[All Time]',
        dimension: '[Time]',
        properties: [],
        statement: '[Time].[All Time]'
      }
    ])
  })

  it('#Descendants', () => {
    expect(
      allocateAxesFilter(
        [
          {
            dimension: '[Time]',
            displayHierarchy: true
          }
        ],
        [],
        DEPARTMENT_ENTITY_TYPE,
        {}
      )
    ).toEqual([
      {
        defaultMember: '[Time].[All Time]',
        dimension: '[Time]',
        properties: [],
        statement: '[Time].[All Time]'
      }
    ])
  })
  

})

describe('GetMDXProperty', () => {
  it('#Basic', () => {
    expect(getMDXProperty(DEPARTMENT_ENTITY_TYPE, { dimension: '[Department]' })).toEqual({
      dimension: '[Department]',
      hierarchy: '[Department]',
      allMember: '[Department].[All Departments]',
      defaultMember: '[Department].[All Departments]'
    })

    expect(
      getMDXProperty(DEPARTMENT_ENTITY_TYPE, { dimension: '[Department]', level: '[Department].[(All)]' })
    ).toEqual({
      allMember: '[Department].[All Departments]',
      defaultMember: '[Department].[All Departments]',
      dimension: '[Department]',
      hierarchy: '[Department]',
      level: '[Department].[(All)]'
    })

    expect(
      getMDXProperty(DEPARTMENT_ENTITY_TYPE, {
        dimension: '[Department]'
      })
    ).toEqual({
      allMember: '[Department].[All Departments]',
      defaultMember: '[Department].[All Departments]',
      dimension: '[Department]',
      hierarchy: '[Department]'
    })

    expect(
      getMDXProperty(DEPARTMENT_ENTITY_TYPE, {
        dimension: '[Department]',
        properties: ['PARENT_UNIQUE_NAME']
      })
    ).toEqual({
      allMember: '[Department].[All Departments]',
      defaultMember: '[Department].[All Departments]',
      dimension: '[Department]',
      hierarchy: '[Department]',
      properties: ['PARENT_UNIQUE_NAME']
    })
  })

  it('Not set hierarchy', () => {
    expect(
      getMDXProperty(DEPARTMENT_ENTITY_TYPE, {
        dimension: '[Time]'
      })
    ).toEqual({
      allMember: '[All Times]',
      defaultMember: '[Time].[All Times]',
      dimension: '[Time]',
      hierarchy: '[Time]'
    })
  })
})

describe('Unite MDXProperty', () => {
  it('#Basic', () => {
    expect(
      uniteMDXProperty([
        {
          dimension: '[Time]',
          level: '[Time].[Year]'
        },
        {
          dimension: C_MEASURES,
          measure: 'Sales'
        },
        {
          dimension: C_MEASURES,
          measure: 'Cost'
        }
      ])
    ).toEqual([
      {
        dimension: '[Time]',
        level: '[Time].[Year]'
      },
      {
        dimension: 'Measures',
        members: ['Sales', 'Cost']
      }
    ])
  })
})
