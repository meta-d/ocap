import { Agent, AgentStatus, AgentType, DataSourceOptions, DSCacheService, MockAgent } from '@metad/ocap-core'
import { EMPTY, firstValueFrom, Observable, skip } from 'rxjs'
import { SQLDataSource } from './sql'

describe('sql', () => {
  let dataSource: SQLDataSource
  beforeAll(() => {
    dataSource = new SQLDataSource(
      {
        type: 'SQL',
        schema: {
          name: 'Sales',
          cubes: [
            {
              name: 'SalesOrder',
              tables: [{ name: 'SalesOrder' }]
            }
          ]
        }
      },
      new MockAgent(),
      new DSCacheService()
    )
  })

  it('should work', async () => {
    const catalogs = await firstValueFrom(dataSource.getCatalogs())
    expect(catalogs).toEqual([
      { label: '销售', name: 'Sales' },
      { label: '库存', name: 'Inventory' }
    ])
  })

  it('getEntityType', async () => {
    let entityType = await firstValueFrom(dataSource.getEntityType('SalesOrder'))
    expect(entityType.name).toEqual('SalesOrder')

    entityType = await firstValueFrom(dataSource.getEntityType('Inventory'))

    expect(entityType).toEqual(null)
  })

  it('getEntityType react schema update', (done) => {
    dataSource.getEntityType('SalesOrder').pipe(skip(1)).subscribe((entityType) => {
      console.log(entityType)
      // expect(entityType.name).toEqual('SalesOrder')
      done()
    })

    setTimeout(() => {
      dataSource.setSchema({
        name: 'Sales',
        cubes: [
          {
            name: 'SalesOrder',
            tables: [{ name: 'SalesOrder1' }]
          }
        ]
      })

      // dataSource.setSchema({
      //   name: 'Sales',
      //   cubes: [
      //     {
      //       name: 'SalesOrder',
      //       tables: [{ name: 'SalesOrder' }],
      //       dimensions: [],
      //       measures: []
      //     }
      //   ]
      // })
    });
  })
})

describe('Get EntityType with Exception', () => {
  let dataSource: SQLDataSource

  class WithExceptionAgent implements Agent {
    type = AgentType.Browser

    selectStatus(): Observable<AgentStatus> {
      return EMPTY
    }
    selectError(): Observable<any> {
      return EMPTY
    }

    error(err: any): void {
      //
    }

    request(dataSource: DataSourceOptions, options: any): Promise<any> {
      return new Promise((resolve, reject) => {
        if (options.method === 'get') {
          if (options.url === 'schema') {
            if (options.statement === 'SELECT * FROM "ErrorTable"') {
              throw new Error(`I am error`)
            }
            return resolve([
              {
                name: 'Sales',
                label: '销售',
                columns: []
              }
            ])
          } else if (options.url === 'catalogs') {
            return resolve([
              { name: 'Sales', label: '销售' },
              { name: 'Inventory', label: '库存' }
            ])
          }
        } else if (options.method === 'post') {
          if (options.url === 'query') {
            const results = []
            return resolve({
              data: results,
              columns: []
            })
          }
        }

        return reject(`Unknow method ${options.url}`)
      })
    }
  }

  beforeAll(() => {
    dataSource = new SQLDataSource(
      {
        type: 'SQL',
        schema: {
          name: 'Sales',
          cubes: [
            {
              __id__: '123',
              name: 'SalesOrder',
              tables: [{ name: 'ErrorTable' }]
            }
          ]
        }
      },
      new WithExceptionAgent(),
      new DSCacheService()
    )
  })

  it('With Exception', (done) => {
    dataSource.getEntityType('SalesOrder').subscribe((entityType) => {
      // expect(entityType).toEqual(null)
      done()
    })
  })

  it('Skip Exception', (done) => {
    dataSource
      .getEntityType('SalesOrder')
      .pipe(skip(1))
      .subscribe((entityType) => {
        expect(entityType).toEqual({ label: '销售', name: 'SalesOrder', properties: {} })
        done()
      })

    setTimeout(() => {
      // Update correct table to get EntityType
      dataSource.updateCube({
        __id__: '123',
        name: 'SalesOrder',
        tables: [{ name: 'SalesOrder' }]
      })
    })
  })
})
