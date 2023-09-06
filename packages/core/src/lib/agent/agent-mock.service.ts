import { Observable, of } from 'rxjs'
import { DataSourceOptions } from '../data-source'
import { AggregationRole } from '../models/index'
import { Agent, AgentStatusEnum, AgentType } from './types'

export class MockAgent implements Agent {
  type = AgentType.Browser

  selectStatus(): Observable<AgentStatusEnum> {
    return of(AgentStatusEnum.ONLINE)
  }
  selectError(): Observable<any> {
    throw new Error('Method not implemented.')
  }

  error(err: any): void {
    // this.error$.next(err)
  }

  request(dataSource: DataSourceOptions, options: any): Promise<any> {
    // console.log(`~~~~~~~~~~~~~~~~~~~~`, dataSource, options)

    return new Promise((resolve, reject) => {
      if (options.method === 'get') {
        if (options.url === 'schema') {
          if (options.table) {
            switch (options.table) {
              case 'SalesOrder':
                return resolve([
                  {
                    schema: 'default',
                    tables: [
                      {
                        name: 'SalesOrder',
                        label: '销售订单',
                        columns: [
                          {
                            name: 'product',
                            label: '产品',
                            type: 'string',
                            aggregationRole: AggregationRole.dimension
                          },
                          {
                            name: 'productCategory',
                            label: '产品类别',
                            type: 'string',
                            aggregationRole: AggregationRole.dimension
                          },
                          {
                            name: 'sales',
                            label: '销售额',
                            type: 'number',
                            aggregationRole: AggregationRole.measure
                          },
                          {
                            name: 'quantity',
                            label: '销售量',
                            type: 'number',
                            aggregationRole: AggregationRole.measure
                          }
                        ]
                      }
                    ]
                  }
                ])
              case 'Inventory':
                return resolve([
                  {
                    schema: 'default',
                    tables: [
                      {
                        name: 'Inventory',
                        label: '库存',
                        columns: [
                          {
                            name: 'product',
                            label: '产品',
                            type: 'string',
                            aggregationRole: AggregationRole.dimension
                          },
                          {
                            name: 'productCategory',
                            label: '产品类别',
                            type: 'string',
                            aggregationRole: AggregationRole.dimension
                          },
                          {
                            name: 'sales',
                            label: '销售额',
                            type: 'number',
                            aggregationRole: AggregationRole.measure
                          },
                          {
                            name: 'quantity',
                            label: '销售量',
                            type: 'number',
                            aggregationRole: AggregationRole.measure
                          }
                        ]
                      }
                    ]
                  }
                ])
              default:
                return resolve([
                  {
                    schema: 'default',
                    tables: [
                      {
                        name: 'Inventory',
                        label: '库存',
                        columns: [
                          {
                            name: 'product',
                            label: '产品',
                            type: 'string',
                            aggregationRole: AggregationRole.dimension
                          },
                          {
                            name: 'productCategory',
                            label: '产品类别',
                            type: 'string',
                            aggregationRole: AggregationRole.dimension
                          },
                          {
                            name: 'sales',
                            label: '销售额',
                            type: 'number',
                            aggregationRole: AggregationRole.measure
                          },
                          {
                            name: 'quantity',
                            label: '销售量',
                            type: 'number',
                            aggregationRole: AggregationRole.measure
                          }
                        ]
                      }
                    ]
                  }
                ])
            }
          } else if (options.statement) {
            return resolve([
              {
                name: 'SalesOrder',
                label: '销售订单',
                columns: [
                  {
                    name: 'product',
                    label: '产品',
                    type: 'string',
                    aggregationRole: AggregationRole.dimension
                  },
                  {
                    name: 'productCategory',
                    label: '产品类别',
                    type: 'string',
                    aggregationRole: AggregationRole.dimension
                  },
                  {
                    name: 'sales',
                    label: '销售额',
                    type: 'number',
                    aggregationRole: AggregationRole.measure
                  },
                  {
                    name: 'quantity',
                    label: '销售量',
                    type: 'number',
                    aggregationRole: AggregationRole.measure
                  }
                ]
              }
            ])
          } else {
            return resolve([
              {
                schema: 'default',
                tables: [
                  {
                    name: 'SalesOrder',
                    label: '销售订单'
                  }
                ]
              }
            ])
          }
        } else if (options.url === 'catalogs') {
          return resolve([{ name: 'default' }, { name: 'foodmart' }])
          // return resolve([
          //   { name: 'Sales', label: '销售' },
          //   { name: 'Inventory', label: '库存' }
          // ])
        }
      } else if (options.method === 'post') {
        if (options.url === 'query') {
          const results = []

        //   randProductCategory({ length: 3 }).forEach((productCategory) => {
        //     randProductAdjective({ length: 5 }).forEach((product) => {
        //       results.push({
        //         product,
        //         productCategory,
        //         sales: randFloat(),
        //         quantity: randFloat()
        //       })
        //     })
        //   })

          return resolve({
            data: results,
            columns: [],
            statement: options.body?.statement
          })
        }
      }

      return reject(`Unknow method ${options.url}`)
    })
  }
}
