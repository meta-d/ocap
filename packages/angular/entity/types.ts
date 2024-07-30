export enum PropertyCapacity {
  Dimension = 'Dimension',
  MeasureGroup = 'MeasureGroup',

  Measure = 'Measure',
  Parameter = 'Parameter',
  MeasureControl = 'MeasureControl',
  MeasureAttributes = 'MeasureAttributes',

  Order = 'Order',

  MeasureStyle = 'MeasureStyle',
  MeasureStylePalette = 'MeasureStylePalette',
  MeasureStylePalettePattern = 'MeasureStylePalettePattern',
  MeasureStyleRole = 'MeasureStyleRole',
  MeasureStyleShape = 'MeasureStyleShape',
  MeasureStyleGridBar = 'MeasureStyleGridBar',
  MeasureStyleReferenceLine = 'MeasureStyleReferenceLine',
  MeasureStyleChartOptions = 'MeasureStyleChartOptions',
  DimensionChart = 'DimensionChart'
}

export type EntitySelectResultType = {
  modelId: string
  dataSource: string
  entities: string[]
}