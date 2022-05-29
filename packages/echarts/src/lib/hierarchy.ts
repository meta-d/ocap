import {
  ChartAnnotation,
  ChartDimension,
  ChartSettings,
  displayByBehaviour,
  EntityType,
  getChartCategory,
  getEntityHierarchy,
  getMemberFromRow,
  getPropertyHierarchy,
  getPropertyMeasure,
  hierarchize,
  mergeOptions,
  Property,
  QueryReturn
} from '@metad/ocap-core'
import { TreemapChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { groupBy, sumBy } from 'lodash'
import { DefaultValueFormatter } from './common'
import { EChartsOptions } from './types'

use([TreemapChart])

export function tree(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options?: EChartsOptions
) {
  if (data.recursiveData?.[0].recursiveHierarchy) {
    console.log(data.recursiveData)

    const series = mergeOptions(
      {
        type: 'tree',
        universalTransition: true,
        data: data.recursiveData?.[0].data
      },
      options?.seriesStyle
    )

    const tooltip = mergeOptions({valueFormatter: DefaultValueFormatter}, options?.tooltip)

    return {
      tooltip,
      series: [series]
    }
  }

  const { nodes, links } = leveledGraph(data.data, chartAnnotation, sumBy)
  const mainMeasureName = getPropertyMeasure(chartAnnotation.measures[0])
  return {
    series: [
      {
        type: 'tree',
        id: mainMeasureName,
        universalTransition: true,
        data: nodes,
        links: links
      }
    ]
  }
}

export function treemap(
  result: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const measures = chartAnnotation.measures
  const mainMeasureName = getPropertyMeasure(measures[0])

  let data
  if (result.recursiveData?.[0].recursiveHierarchy) {
    data = hierarchize(result.data, result.recursiveData?.[0].recursiveHierarchy, mainMeasureName)
  } else {
    data = leveledHierarchy(result.data, chartAnnotation, sumBy)?.[0].children
  }

  const tooltip = mergeOptions({valueFormatter: DefaultValueFormatter}, options?.tooltip)

  return {
    tooltip,
    series: [
      {
        type: 'treemap',
        id: mainMeasureName,
        animationDurationUpdate: 1000,
        roam: false,
        nodeClick: undefined,
        data: data,
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

export function sunburst(
  result: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const measures = chartAnnotation.measures
  const mainMeasureName = getPropertyMeasure(measures[0])

  let data
  if (result.recursiveData?.[0].recursiveHierarchy) {
    data = hierarchize(result.data, result.recursiveData?.[0].recursiveHierarchy, mainMeasureName)
  } else {
    data = leveledHierarchy(result.data, chartAnnotation, sumBy)?.[0].children
  }

  const tooltip = mergeOptions({valueFormatter: DefaultValueFormatter}, options?.tooltip)

  return {
    tooltip,
    series: [
      {
        type: 'sunburst',
        id: mainMeasureName,
        radius: ['20%', '90%'],
        animationDurationUpdate: 1000,
        nodeClick: undefined,
        data,
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

export function sankey(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const category = getChartCategory(chartAnnotation)
  const mainMeasureName = getPropertyMeasure(chartAnnotation.measures[0])
  const recursiveHierarchy = data.recursiveData?.[0].recursiveHierarchy
  const { nodes, links } = recursiveHierarchy
    ? convertTree2NodeLinks(
        data.data,
        getEntityHierarchy(entityType, { dimension: recursiveHierarchy.valueProperty }),
        recursiveHierarchy.parentNodeProperty,
        recursiveHierarchy.levelProperty,
        category,
        mainMeasureName
      )
    : leveledGraph(data.data, chartAnnotation, sumBy)

  const tooltip = mergeOptions({valueFormatter: DefaultValueFormatter}, options?.tooltip)
  return {
    tooltip,
    series: [
      {
        type: 'sankey',
        id: mainMeasureName,
        universalTransition: true,
        data: nodes,
        links: links
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
      children: data
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
          parent: parent.name ? parent : null
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

  return { nodes: Object.values(nodes), links }
}

export function convertTree2NodeLinks(
  data: Array<unknown>,
  child: Property,
  parent: string,
  level: string,
  dimension: ChartDimension,
  measure: string
) {
  const nodes = []
  const links = []

  // let sum = 0
  const totalPlaceholder = 'Total'

  // 解析nodes 和 links
  const nodesMap = new Map()
  data.forEach((item) => {
    nodesMap.set(item[child.name], {
      name: item[child.name],
      depth: level ? item[level] : null,
      value: Math.abs(item[measure]),
      label: displayByBehaviour(getMemberFromRow(item, child), dimension.displayBehaviour),
      rawValue: item
    })

    links.push({
      source: item[parent] || totalPlaceholder,
      target: item[child.name],
      value: Math.abs(item[measure]),
      label: displayByBehaviour(getMemberFromRow(item, child), dimension.displayBehaviour),
      rawValue: item
      // sourceValue: ''
    })
  })

  let totalValue = 0
  links.forEach((x) => {
    if (x.source === totalPlaceholder) {
      totalValue += Number(x.value)
    }
  })

  nodes.push({
    name: totalPlaceholder,
    depth: 0,
    value: totalValue
  })
  nodesMap.forEach((node) => {
    nodes.push(node)
  })

  nodes.forEach((x) => {
    x.totalValue = totalValue
  })

  links.forEach((x) => {
    x.totalValue = totalValue
    x.sourceValue = nodes.find((node) => node.name === x.source).value
  })

  return {
    nodes,
    links
  }
}
