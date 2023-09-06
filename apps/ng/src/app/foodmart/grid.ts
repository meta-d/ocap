import { AnalyticalGridOptions } from '@metad/ocap-angular/analytical-grid'
import { C_MEASURES } from '@metad/ocap-core'

export const MeasureRowGrid = {
  title: 'Grid: measures row',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    analytics: {
      rows: [
        {
          dimension: '[Time]',
          hierarchy: '[Time]',
          level: '[Time].[Month]'
        }
      ],
      columns: [
        {
          dimension: C_MEASURES,
          members: ['Sales']
        }
      ]
    }
  },
  columns: {},
  options: {
    showToolbar: true,
    grid: true,
    sortable: true,
    initialRowLevel: 2,
    initialColumnLevel: 2,
    selectable: true,
    strip: true
  } as AnalyticalGridOptions
}
