import {
  ChartAnnotation,
  ChartSettings,
  EntityType,
  getChartTrellis,
  getPropertyHierarchy,
  QueryReturn
} from '@metad/ocap-core'
import { chunk, groupBy, isArray } from 'lodash'
import { dataZoom } from './data-zoom'
import { EChartsOptions } from './types'

export function gatherCoordinates(coordinates: any[], type: 'pie' | string, options: EChartsOptions) {
  const echartsOptions = {
    dataset: [],
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
    visualMap: [],
    tooltip: [],
    legend: [],
    dataZoom: dataZoom(options)
  }

  coordinates.forEach((coordinate, gridIndex) => {
    echartsOptions.grid.push(coordinate.grid)

    coordinate.datasets.forEach(({ dataset, series }) => {
      series.forEach((series) => {
        echartsOptions.series.push({
          ...series,
          xAxisIndex: echartsOptions.xAxis.length + (series.xAxisIndex ?? 0),
          yAxisIndex: echartsOptions.yAxis.length + (series.yAxisIndex ?? 0),
          datasetIndex: echartsOptions.dataset.length + (series.datasetIndex ?? 0),
          type: series.type ?? type
        })
      })

      if (isArray(dataset)) {
        echartsOptions.dataset.push(
          ...dataset
        )
      } else {
        echartsOptions.dataset.push({
          ...dataset
        })
      }
  
      if (type !== 'pie') {
        echartsOptions.xAxis.push(
          ...coordinate.xAxis.map((xAxis) => ({
            ...xAxis,
            gridIndex
          }))
        )
        echartsOptions.yAxis.push(
          ...coordinate.yAxis.map((yAxis) => ({
            ...yAxis,
            gridIndex
          }))
        )
      }
    })

    echartsOptions.visualMap.push(...coordinate.visualMap)
    echartsOptions.tooltip.push(...coordinate.tooltip)
    echartsOptions.legend.push(...coordinate.legend)
  })

  return echartsOptions
}

export function coordinates(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions,
  coordinateType: 'grid' | 'pie',

  cartesianCoordinate: (...i: any) => any
) {
  const trellis = getChartTrellis(chartAnnotation)
  if (trellis) {
    const trellisName = getPropertyHierarchy(trellis)
    const trellisResults = groupBy(data.data, trellisName)

    const coordinates = Object.keys(trellisResults).map((trellisKey) => {
      const dimensions = [...chartAnnotation.dimensions]
      const index = dimensions.indexOf(trellis)
      dimensions.splice(index, 1)

      const coordinate = cartesianCoordinate(
        trellisResults[trellisKey],
        {
          ...chartAnnotation,
          dimensions
        },
        entityType,
        settings,
        options
      )

      coordinate.datasets = coordinate.datasets.map((dataset) => ({
        ...dataset,
        series: dataset.series.map((series) => ({
          ...series,
          id: `${trellisKey}-${series.id}`
        }))
      }))
      return coordinate
    })

    const trellisHorizontal = settings?.trellisHorizontal ?? 2
    const trellisVertical = Math.ceil(coordinates.length / trellisHorizontal)

    const coordinatesGroups = chunk(coordinates, trellisHorizontal)

    const coordinateResults = []
    coordinatesGroups.forEach((group, v) => {
      group.forEach((coordinate, h) => {

        if (coordinateType === 'grid') {
          coordinateResults.push({
            ...coordinate,
            grid: {
              ...coordinate.grid,
              left: (h + 0.1) * (100 / trellisHorizontal) + '%',
              top: (v + 0.1) * (100 / trellisVertical) + '%',
              width: (100 / trellisHorizontal) * 0.8 + '%',
              height: (100 / trellisVertical) * 0.8 + '%'
            }
          })
        } else if (coordinateType === 'pie') {

          const minRadius =  Math.max(100 / trellisHorizontal, 100 / trellisVertical) 
          const radius = (chartAnnotation.chartType.variant === 'Doughnut' ||
            chartAnnotation.chartType.variant === 'Nightingale') ? 
            [minRadius * 0.4 + '%', minRadius * 0.8 + '%']:
            minRadius * 0.8 + '%'

          coordinateResults.push({
            ...coordinate,
            datasets: coordinate.datasets.map((dataset) => ({
              ...dataset,
              series: dataset.series.map((series) => ({
                ...series,
                radius,
                center: [
                  (h + 0.5) * (100 / trellisHorizontal) + '%',
                  (v + 0.5) * (100 / trellisVertical) + '%',
                ]
              }))
            }))
          })
        }
      })
    })

    return coordinateResults
  }

  return [cartesianCoordinate(data.data, chartAnnotation, entityType, settings, options)]
}
