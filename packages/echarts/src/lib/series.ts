import { ChartMeasure, mergeOptions, ReferenceLineType, ReferenceLineValueType } from '@metad/ocap-core'
import { AxisEnum, EChartsOptions } from './types'

export function referenceLines(axis1: ChartMeasure, axis2: ChartMeasure, options: EChartsOptions, valueAxis: AxisEnum) {
  const markLine = mergeOptions({ data: [] }, options?.seriesStyle?.markLine)
  const markPoint = mergeOptions({ data: [] }, options?.seriesStyle?.markPoint)
  axis1?.referenceLines?.forEach((referenceLine) => {
    if (referenceLine.type) {
      const referenceLineData = {
        name: referenceLine.label
        // valueIndex: valueAxis === AxisEnum.x ? 0 : 1
      }

      if (referenceLine.valueType === ReferenceLineValueType.fixed) {
        referenceLineData[valueAxis] = referenceLine.value
      } else if (referenceLine.valueType === ReferenceLineValueType.dynamic) {
        referenceLineData['type'] = referenceLine.aggregation
      }

      if (referenceLine.type === ReferenceLineType.markLine) {
        // markLine = {
        //   label: {
        //     show: true,
        //     position: 'insideStartTop',
        //     formatter: '{b}:{c}'
        //   },
        //   data: []
        // }

        markLine.data.push(referenceLineData)
      } else if (referenceLine.type === ReferenceLineType.markPoint) {
        // markPoint = {
        //   label: {
        //     show: true,
        //     position: 'insideStartTop',
        //     formatter: '{b}:{c}'
        //   },
        //   data: []
        // }
        markPoint.data.push(referenceLineData)
      }
    }
  })

  axis2?.referenceLines?.forEach((referenceLine) => {
    if (referenceLine.type) {
      const referenceLineData = {
        name: referenceLine.label,
        valueIndex: valueAxis === AxisEnum.y ? 0 : 1
      }

      if (referenceLine.valueType === ReferenceLineValueType.fixed) {
        referenceLineData[valueAxis] = referenceLine.value
      } else if (referenceLine.valueType === ReferenceLineValueType.dynamic) {
        referenceLineData['type'] = referenceLine.aggregation
      }

      if (referenceLine.type === ReferenceLineType.markLine) {
        // markLine = {
        //   label: {
        //     show: true,
        //     position: 'insideStartTop',
        //     formatter: '{b}:{c}'
        //   },
        //   data: []
        // }

        markLine.data.push(referenceLineData)
      } else if (referenceLine.type === ReferenceLineType.markPoint) {
        // markPoint = {
        //   label: {
        //     show: true,
        //     position: 'insideStartTop',
        //     formatter: '{b}:{c}'
        //   },
        //   data: []
        // }
        markPoint.data.push(referenceLineData)
      }
    }
  })

  return {
    markLine,
    markPoint
  }
}
