import { randFloat, randProductAdjective, randProductCategory } from '@ngneat/falso'
import { Observable, of } from 'rxjs'
import { AggregationRole } from '../csdl'
import { DataSourceOptions } from '../data-source'
import { Agent, AgentStatus, AgentType } from './types'

export class MockAgent implements Agent {
  type = AgentType.Browser
  selectStatus(): Observable<AgentStatus> {
    return of(AgentStatus.ONLINE)
  }

  request(dataSource: DataSourceOptions, options: any): Promise<any> {
    console.log(`~~~~~~~~~~~~~~~~~~~~`, dataSource, options)

    return new Promise((resolve, reject) => {
      if (options.method === 'get') {
        if (options.url === 'schema') {
          if (options.table === 'SalesOrder') {
            return resolve({
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
            })
          }
        }
      } else if (options.method === 'post') {
        if (options.url === 'query') {
          const results = []
          randProductCategory({ length: 3 }).forEach((productCategory) => {
            randProductAdjective({ length: 5 }).forEach((product) => {
              results.push({
                product,
                productCategory,
                sales: randFloat(),
                quantity: randFloat()
              })
            })
          })
          return resolve({
            data: results,
            columns: []
          })
        }
      }

      resolve({})
    })
  }
}
