import { Injectable } from '@angular/core'
import { Agent, AgentStatus, AgentType, DataSourceOptions } from '@metad/ocap-core'
import { randCompanyName, randFloat, randNumber, randProductAdjective, randProductCategory } from '@ngneat/falso'
import { Observable, of, Subject } from 'rxjs'

const columns = [
  {
    name: 'OrderId',
    label: '订单号',
    type: 'string'
  },
  {
    name: 'product',
    label: '产品',
    type: 'string'
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
    name: 'sales',
    label: '销售额',
    type: 'number'
  },
  {
    name: 'quantity',
    label: '销售量',
    type: 'number'
  }
]

const SalesOrder = {
  name: 'SalesOrder',
  label: '销售订单',
  columns
}

const SalesOrder10s = {
  name: 'SalesOrder10s',
  label: '销售订单10秒',
  columns
}

const SalesOrder3s = {
  name: 'SalesOrder3s',
  label: '销售订单3秒',
  columns
}

@Injectable()
export class MockAgent implements Agent {
  type = AgentType.Browser

  private error$ = new Subject()
  selectStatus(): Observable<AgentStatus> {
    return of(AgentStatus.ONLINE)
  }

  selectError(): Observable<any> {
    return this.error$
  }

  error(err: any): void {
    this.error$.next(err)
  }

  request(dataSource: DataSourceOptions, options: any): Promise<any> {
    console.log(`~~~~~~~~~~~~~~~~~~~~`, dataSource, options)

    return new Promise((resolve, reject) => {
      if (options.method === 'get') {
        if (options.url === 'schema') {
          switch (options.table) {
            case SalesOrder10s.name:
              return resolve([SalesOrder10s])
            case SalesOrder3s.name:
              return resolve([SalesOrder3s])
            case SalesOrder.name:
              return resolve([SalesOrder])
            default: {
              if (options.statement === 'SELECT * FROM "SalesOrder"') {
                return resolve([SalesOrder])
              }
            }
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

          if (options.body?.statement?.includes(SalesOrder10s.name)) {
            setTimeout(() => {
              resolve({
                data: results,
                columns
              })
            }, 10000)

            return
          }

          if (options.body?.statement?.includes(SalesOrder3s.name)) {
            setTimeout(() => {
              resolve({
                data: results,
                columns
              })
            }, 3000)

            return
          }

          setTimeout(() => {
            resolve({
              data: results,
              columns: [
                {
                  name: 'OrderId',
                  label: '订单号',
                  type: 'string'
                },
                {
                  name: 'product',
                  label: '产品',
                  type: 'string'
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
