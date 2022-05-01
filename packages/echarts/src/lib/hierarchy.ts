import { ChartAnnotation, EntityType, getPropertyHierarchy, getPropertyMeasure, QueryReturn } from '@metad/ocap-core'
import { TreemapChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { groupBy, sumBy } from 'lodash'

use([TreemapChart])

export function treemap(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  const result = leveledHierarchy(data.results, chartAnnotation, sumBy)
  const measures = chartAnnotation.measures
  const mainMeasureName = getPropertyMeasure(measures[0])

  return {
    series: [
      {
        type: 'treemap',
        id: mainMeasureName,
        animationDurationUpdate: 1000,
        roam: false,
        nodeClick: undefined,
        data: result[0].children,
        universalTransition: true,
        label: {
          show: true
        },
        breadcrumb: {
          show: false
        },
        levels: [
          {
            itemStyle: {
              borderColor: '#555',
              borderWidth: 4,
              gapWidth: 4
            }
          },
          {
            colorSaturation: [0.3, 0.6],
            itemStyle: {
              borderColorSaturation: 0.7,
              gapWidth: 2,
              borderWidth: 2
            }
          },
          {
            colorSaturation: [0.3, 0.5],
            itemStyle: {
              borderColorSaturation: 0.6,
              gapWidth: 1
            }
          },
          {
            colorSaturation: [0.3, 0.5]
          }
        ]
      }
    ]
  }
}

export function sunburst(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  const result = leveledHierarchy(data.results, chartAnnotation, sumBy)
  const measures = chartAnnotation.measures
  const mainMeasureName = getPropertyMeasure(measures[0])

  return {
    series: [
      {
        type: 'sunburst',
        id: mainMeasureName,
        radius: ['20%', '90%'],
        animationDurationUpdate: 1000,
        nodeClick: undefined,
        data: result[0].children,
        universalTransition: true,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.5)'
        },
        label: {
          //   show: false
        }
      }
    ]
  }
}

export function sankey(data: QueryReturn<unknown>, chartAnnotation: ChartAnnotation, entityType: EntityType) {
  const {nodes, links} = leveledGraph(data.results, chartAnnotation, sumBy)
  const mainMeasureName = getPropertyMeasure(chartAnnotation.measures[0])
  return {
    series: [
      {
        type: 'sankey',
        id: mainMeasureName,
        universalTransition: true,
        data: nodes,
        links: links,
      }
    ]
  }
}

export function leveledHierarchy(
  data: Array<unknown>,
  chartAnnotation: ChartAnnotation,
  aggregator: (data, key) => number
) {
  const levels = chartAnnotation.dimensions
  const measures = chartAnnotation.measures
  const measureName = getPropertyMeasure(measures[0])
  const results = [
    {
      name: 'all',
      children: data,
      value: null
    }
  ]
  let result = results

  levels.forEach((level) => {
    const levelName = getPropertyHierarchy(level)
    const _result = result
    result = []
    _result.forEach((parent) => {
      const childs = groupBy(parent.children, levelName)
      parent.children = Object.keys(childs).map((key) => {
        const child = {
          name: key,
          children: childs[key],
          value: aggregator(childs[key], measureName)
        }
        result.push(child)
        return child
      })
    })
  })

  return results
}

/**
 * 
 * @param data 
 * @param chartAnnotation 
 * @param aggregator 
 */
export function leveledGraph(
  data: Array<unknown>,
  chartAnnotation: ChartAnnotation,
  aggregator: (data, key) => number
) {
  const levels = chartAnnotation.dimensions
  const measures = chartAnnotation.measures

  const measureName = getPropertyMeasure(measures[0])
  let result = [
    {
      name: 'all',
      children: data,
    }
  ]
  const nodes = {}
  const links = []

  levels.forEach((level) => {
    const levelName = getPropertyHierarchy(level)
    const _result = result
    result = []
    _result.forEach((parent) => {
      const childs = groupBy(parent.children, levelName)
      Object.keys(childs).forEach((key) => {
        if (!nodes[key]) {
          nodes[key] = {
            name: key
          }
        }
        const child = {
          name: key,
          children: childs[key],
          parent: parent.name ? parent : null,
        }
        result.push(child)
        if (parent.name) {
          links.push({
            source: parent.name,
            target: key,
            value: aggregator(childs[key], measureName)
          })
        }
      })
    })
  })

  return {nodes: Object.values(nodes), links}
}