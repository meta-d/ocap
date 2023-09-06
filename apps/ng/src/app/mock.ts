import { Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentStatusEnum, AgentType, DataSourceOptions } from '@metad/ocap-core'
import { randCompanyName, randFloat, randNumber, randProductAdjective, randProductCategory } from '@ngneat/falso'
import { Observable, of } from 'rxjs'

const SalesOrder = {
  name: 'SalesOrder',
  label: '销售订单',
  columns: [
    {
      name: 'OrderId',
      label: '订单号',
      type: 'string',
    },
    {
      name: 'product',
      label: '产品',
      type: 'string',
      // role: AggregationRole.dimension
    },
    {
      name: 'productCategory',
      label: '产品类别',
      type: 'string'
      // role: AggregationRole.dimension
    },
    {
      name: 'Department',
      label: '部门',
      type: 'string'
    },
    {
      name: 'sales',
      label: '销售额',
      type: 'number'
      // role: AggregationRole.measure
    },
    {
      name: 'quantity',
      label: '销售量',
      type: 'number'
      // role: AggregationRole.measure
    }
  ]
}

@Injectable()
export class MockAgent implements Agent {
  type = AgentType.Browser

  selectStatus(): Observable<AgentStatus | AgentStatusEnum> {
    return of(AgentStatusEnum.ONLINE)
  }
  selectError(): Observable<any> {
    throw new Error('Method not implemented.')
  }
  error(err: any): void {
    console.error(err)
  }

  request(dataSource: DataSourceOptions, options: any): Promise<any> {
    console.log(`~~~~~~~~~~~~~~~~~~~~`, dataSource, options)

    return new Promise((resolve, reject) => {
      if (options.method === 'get') {
        if (options.url === 'schema') {
          if (options.table === 'SalesOrder') {
            return resolve([
              {
                tables: [
                  SalesOrder
                ]
              }
            ])
          } else if (options.statement === "SELECT * FROM `SalesOrder`") {
            return resolve([
              {
                tables: [
                  SalesOrder
                ]
              }
            ])
          }
        }
      } else if (options.method === 'post') {
        if (options.url === 'query') {
          const results = []

          if (options.body?.statement?.includes(`"Department" AS "Department"`)) {
            let departmentCode = 0
            randCompanyName({ length: 5 }).forEach((name) => {
              departmentCode++
              const department1 = departmentCode
              results.push({
                Department: department1,
                DepartmentName: name,
                quantity: randFloat()
              })
              randCompanyName({ length: 5 }).forEach((name) => {
                departmentCode++
                const department2 = departmentCode
                results.push({
                  Department: department2,
                  DepartmentName: name,
                  DepartmentParent: department1,
                  quantity: randFloat()
                })

                randCompanyName({ length: 3 }).forEach((name) => {
                  departmentCode++
                  const department3 = departmentCode
                  results.push({
                    Department: department3,
                    DepartmentName: name,
                    DepartmentParent: department2,
                    quantity: randFloat()
                  })
                })
              })
            })

            return resolve({
              data: results,
              columns: [
                {
                  name: 'Department',
                  label: '部门',
                  type: 'string'
                },
                {
                  name: 'DepartmentName',
                  label: '部门',
                  type: 'string'
                },
                {
                  name: 'DepartmentParent',
                  label: '上级部门',
                  type: 'string'
                }
              ]
            })
          }

          randProductCategory({ length: 3 }).forEach((productCategory) => {
            const DepartmentParent = randCompanyName()
            randProductAdjective({ length: 5 }).forEach((product) => {
              results.push({
                OrderId: randNumber(),
                product: randNumber(),
                productName: product,
                productCategory,
                Department: randCompanyName(),
                DepartmentParent,
                sales: randFloat(),
                quantity: randFloat()
              })
            })
          })

          setTimeout(() => {
            resolve({
              data: results,
              columns: [
                {
                  name: 'OrderId',
                  label: '订单号',
                  type: 'string',
                },
                {
                  name: 'product',
                  label: '产品',
                  type: 'string',
                },
                {
                  name: 'productCategory',
                  label: '产品类别',
                  type: 'string'
                },
                {
                  name: 'Department',
                  label: '部门',
                  type: 'string'
                },
                {
                  name: 'DepartmentParent',
                  label: '上级部门',
                  type: 'string'
                }
              ]
            })
          }, 1000)

          return
        }
      }

      resolve({})
    })
  }
}
