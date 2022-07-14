import { AggregationRole, ChartAnnotation, C_MEASURES } from '@metad/ocap-core'

export const SALES_ENTITY_TYPE = {
  name: 'Sales',
  properties: {
    Time: {
      name: 'Time',
      role: AggregationRole.dimension
    },
    sales: {
      name: 'sales',
      role: AggregationRole.measure
    }
  }
}

export const CHART_ANNOTATION: ChartAnnotation = {
  chartType: {
    type: 'Scatter'
  },
  dimensions: [
    {
      dimension: 'Time'
    }
  ],
  measures: [
    {
      dimension: C_MEASURES,
      measure: 'sales'
    }
  ]
}
