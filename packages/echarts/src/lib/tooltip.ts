import { ChartDimension, ChartMeasure, ChartMeasureRoleType, ChartSettings, getPropertyUnitName, Property } from '@metad/ocap-core'
import {
  echartsFormatNumber,
  formatCategoryLabel,
  formatMeasureLabel,
  formatMeasuresLabel,
  getSeriesComponentMeasureName,
  _formatDimensionValue
} from './common'
import { AxisEnum, SeriesComponentType } from './types'

/**
 * 计算出 ECharts tooltip 配置
 *
 * @param tooltipOptions
 * @param dimProperty
 * @param measures
 * @param seriesComponents
 * @param locale
 * @returns
 */
export function getEChartsTooltip(
  tooltipOptions,
  dimProperty: Property,
  measures: Array<{ measure: ChartMeasure; property: Property }>,
  seriesComponents: SeriesComponentType[],
  locale: string,
  rowRuler = (data) => data
) {
  const tooltip: any = {
    trigger: tooltipOptions?.trigger || 'item'
  }

  const tooltipMeasures = measures.filter(({ measure }) => measure.role === ChartMeasureRoleType.Tooltip)

  tooltip.formatter = (params: any) => {
    const texts = []
    if (Array.isArray(params)) {
      params = params.filter((param) => {
        return (
          seriesComponents[param.seriesIndex] &&
          !seriesComponents[param.seriesIndex].noDisplay &&
          param.data[param.seriesName] !== '-'
        )
      })

      const param = params[0]
      texts.push(_formatDimensionValue(rowRuler(param.data), dimProperty))
      params.forEach((param) => {
        // const property = seriesComponents[param.seriesIndex].property
        const measure = measures.find((item) => item.measure.measure === seriesComponents[param.seriesIndex].measure)
        const row = rowRuler(param.data)
        texts.push(param.marker + formatMeasureLabel(row, measure, locale, tooltipOptions?.shortNumber))
      })

      tooltipMeasures.forEach((measure) => {
        const row = rowRuler(param.data)
        texts.push(param.marker + formatMeasureLabel(row, measure, locale, tooltipOptions?.shortNumber))
      })
    } else {
      const row = rowRuler(params.data)
      texts.push(params.marker + _formatDimensionValue(row, dimProperty))
      texts.push(formatMeasuresLabel(row, measures, locale, tooltipOptions?.shortNumber))
    }

    return texts.join('<br>')
  }

  return tooltip
}

/**
 * 计算矩阵 DataSet 相应的 Tooltip 组件属性
 * 
 * @returns 
 */
export function getEChartsMatrixTooltip(
  tooltipOptions: any,
  chartCategory: ChartDimension,
  seriesCategory: ChartDimension,
  _categoryAxis: AxisEnum,
  _valueAxis: AxisEnum,
  categoryValueTexts: Map<string, string>,
  seriesValueTexts: Map<string, string>,
  seriesComponents: SeriesComponentType[],
  settings: ChartSettings
) {
  const tooltip: any = {
    trigger: tooltipOptions?.trigger || 'item'
  }

  const short = tooltipOptions?.shortNumber
  const showMeasureName = tooltipOptions?.showMeasureName
  const categoryAxis = AxisEnum[_categoryAxis]
  const valueAxis = AxisEnum[_valueAxis]
  const locale = settings.locale

  // 如果 multiple or stacked 图是以 category 字段为 series 则重写 formatter 方法以适应
  tooltip.formatter = (params: any) => {
    const texts = []
    if (Array.isArray(params)) {
      params = params.filter((param) => {
        return (
          seriesComponents[param.seriesIndex] &&
          !seriesComponents[param.seriesIndex].noDisplay &&
          param.data[param.seriesName] !== '-'
        )
      })
      texts.push(
        formatCategoryLabel(params[0].data[params[0].encode[categoryAxis][0]], categoryValueTexts, chartCategory)
      )

      params
        .filter((param) => {
          const value = param.data[param.encode[valueAxis][0]]
          return value !== undefined && value !== '-'
        })
        .forEach((param) => {
          const unitName = getPropertyUnitName(seriesComponents[param.seriesIndex]?.property)
          let unit: any = ''
          if (unitName) {
            unit = param.data[param.data.length - 1][unitName]
            if (unit === 'P1') {
              unit = '%'
            }
          }
          if (seriesComponents[param.seriesIndex]?.formatting?.unit) {
            unit = seriesComponents[param.seriesIndex]?.formatting?.unit
          }
          let text = `${param.marker}${formatCategoryLabel(
            param.dimensionNames[param.encode[valueAxis][0]],
            seriesValueTexts,
            seriesCategory
          )}`
          if (showMeasureName) {
            texts.push(text)
            texts.push(
              `${getSeriesComponentMeasureName(seriesComponents, param.seriesIndex)}: ${echartsFormatNumber(
                param.data[param.encode[valueAxis][0]],
                settings.digitInfo,
                short,
                locale
              )} ${unit}`
            )
          } else {
            text = `${text}: ${echartsFormatNumber(
              param.data[param.encode[valueAxis][0]],
              settings.digitInfo,
              short,
              locale
            )} ${unit}`
            texts.push(text)
          }
        })
    } else {
      // params.seriesIndex 代表的是全局 series 组件的索引序号, 而这里是某一个 measure 下的 series 组件们
      // const seriesComponent = seriesComponents[params.seriesIndex]
      const seriesComponent = seriesComponents.find(({name}) => name === params.seriesName)
      texts.push(formatCategoryLabel(params.data[params.encode[categoryAxis][0]], categoryValueTexts, chartCategory))

      texts.push(
        formatCategoryLabel(params.dimensionNames[params.encode[valueAxis][0]], seriesValueTexts, seriesCategory)
      )

      // 判断 进行 数据简化操作 还是进行 数据格式化操作
      texts.push(
        `${params.marker} ${seriesComponent?.property?.label || seriesComponent?.property?.name}: ${echartsFormatNumber(
          params.data[params.encode[valueAxis][0]],
          settings?.digitInfo,
          seriesComponent.formatting?.shortNumber ?? short,
          locale
        )}`
      )
    }

    return texts.join('<br>')
  }

  return tooltip
}
