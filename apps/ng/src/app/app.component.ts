import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { map } from 'rxjs/operators'
import { ReferenceLineType, ReferenceLineValueType, ReferenceLineAggregation, ChartDimensionRoleType } from '@metad/ocap-core'


@Component({
  selector: 'metad-ocap-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title$ = this.httpClient.get<{ message: string }>('/api').pipe(map((res) => res.message))

  cards = [
    {
      title: 'Sales Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Bar'
          },
          dimensions: [
            {
              dimension: 'product',
              role: ChartDimensionRoleType.Stacked
            },
            {
              dimension: 'productCategory'
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            }
          ]
        }
      }
    },
    {
      title: 'Purchase Order Bar',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'PurchaseOrder',
        chartAnnotation: {
          chartType: {
            type: 'Bar'
          },
          dimensions: [
            {
              dimension: 'product'
            },
            {
              dimension: 'productCategory'
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales',
              palette: {
                name: 'PuOr',
                pattern: 1
              },
              referenceLines: [
                {
                  label: 'Sales Average',
                  type: ReferenceLineType.markLine,
                  valueType: ReferenceLineValueType.dynamic,
                  aggregation: ReferenceLineAggregation.average
                }
              ]
            }
          ]
        }
      }
    },
    {
      title: 'Sales Order Line',
      dataSettings: {
        dataSource: 'Sales',
        entitySet: 'SalesOrder',
        chartAnnotation: {
          chartType: {
            type: 'Line'
          },
          dimensions: [
            {
              dimension: 'product'
            },
            {
              dimension: 'productCategory',
              role: ChartDimensionRoleType.Trellis
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'sales'
            }
          ]
        }
      },
    }
  ]
  constructor(private httpClient: HttpClient) {}
}
