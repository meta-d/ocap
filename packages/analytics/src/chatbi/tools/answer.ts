import { tool } from '@langchain/core/tools'
import {
	ChartAnnotation,
	ChartBusinessService,
	ChartDimensionRoleType,
	DataSettings,
	Dimension,
	EntityType,
	FilteringLogic,
	formatNumber,
	formatShortNumber,
	getChartSeries,
	getEntityHierarchy,
	getEntityProperty,
	getPropertyHierarchy,
	getPropertyMeasure,
	isBlank,
	ISlicer,
	isNil,
	isTimeRangesSlicer,
	Measure,
	OrderBy,
	PresentationVariant,
	PropertyMeasure,
	slicerAsString,
	TimeRangesSlicer,
	timeRangesSlicerAsString,
	toAdvancedFilter,
	tryFixDimension,
	tryFixSlicer,
	tryFixVariableSlicer,
	workOutTimeRangeSlicers
} from '@metad/ocap-core'
import { getErrorMessage, race } from '@metad/server-common'
import { firstValueFrom, Subject, takeUntil } from 'rxjs'
import { ChatBIConversation } from '../conversation'
import { ChatLarkMessage } from '../message'
import { ChatAnswerSchema, ChatBILarkContext, ChatContext, IChatBIConversation } from '../types'
import { createBaseChart } from './charts/chart'
import { createDualAxisChart, createSeriesChart } from './charts/combination'

const TABLE_PAGE_SIZE = 10

export type ChatAnswer = {
	preface: string
	visualType: 'Chart' | 'Table' | 'KPI'
	dataSettings: DataSettings
	chartType: {
		type: string
	}
	dimensions: Dimension[]
	measures: Measure[]
	variables: ISlicer[]
	slicers: ISlicer[]
	timeSlicers: TimeRangesSlicer[]
	top: number
	orders: OrderBy[]
}

export function createChatAnswerTool(context: ChatContext, larkContext: ChatBILarkContext) {
	const { chatId, logger, dsCoreService, conversation } = context
	return tool(
		async (answer): Promise<string> => {
			logger.debug(`Execute copilot action 'answerQuestion':`, JSON.stringify(answer, null, 2))
			try {
				// 限制总体超时时间
				return await race(
					ChatBIConversation.toolCallTimeout,
					(async () => {
						let entityType = null
						if (answer.dataSettings) {
							// Make sure datasource exists
							const _dataSource = await dsCoreService._getDataSource(answer.dataSettings.dataSource)
							const entity = await firstValueFrom(
								dsCoreService.selectEntitySet(
									answer.dataSettings.dataSource,
									answer.dataSettings.entitySet
								)
							)
							entityType = entity.entityType
						}

						// Fetch data for chart or table or kpi
						if (answer.dimensions?.length || answer.measures?.length) {
							const { categoryMembers } = await drawChartMessage(
								{ ...context, entityType: entityType || context.entityType },
								conversation,
								answer as ChatAnswer
							)
							// Max limit 20 members
							const members = categoryMembers
								? JSON.stringify(Object.values(categoryMembers).slice(0, 20))
								: 'Empty'

							return `The analysis data has been displayed to the user. The dimension members involved in this data analysis are:
${members}
Please give more analysis suggestions about other dimensions or filter by dimensioin members, 3 will be enough.`
						}

						return `图表答案已经回复给用户了，请不要重复回答了。`
					})()
				)
			} catch (err) {
				logger.debug(getErrorMessage(err))
				return `Error: ${getErrorMessage(err)}; If more information is needed from the user, remind the user directly.`
			}
		},
		{
			name: 'answerQuestion',
			description: 'Show chart answer for the question to user',
			schema: ChatAnswerSchema
		}
	)
}

async function drawChartMessage(
	context: ChatContext,
	conversation: IChatBIConversation,
	answer: ChatAnswer
): Promise<any> {
	const { entityType } = context
	const chartService = new ChartBusinessService(context.dsCoreService)
	const destroy$ = new Subject<void>()

	const chartAnnotation = {
		chartType: answer.chartType,
		dimensions: answer.dimensions?.map((dimension) => tryFixDimension(dimension, context.entityType)),
		measures: answer.measures?.map((measure) => tryFixDimension(measure, context.entityType))
	}

	const slicers = []
	if (answer.variables) {
		slicers.push(...answer.variables.map((slicer) => tryFixVariableSlicer(slicer, entityType)))
	}
	if (answer.slicers) {
		slicers.push(...answer.slicers.map((slicer) => tryFixSlicer(slicer, entityType)))
	}
	if (answer.timeSlicers) {
		const timeSlicers = answer.timeSlicers
			.map((slicer) => workOutTimeRangeSlicers(new Date(), { ...slicer, currentDate: 'TODAY' }, entityType))
			.map((ranges) => toAdvancedFilter(ranges, FilteringLogic.And))
		slicers.push(...timeSlicers)
	}

	const presentationVariant: PresentationVariant = {}
	if (answer.top) {
		presentationVariant.maxItems = answer.top
	}
	if (answer.orders) {
		presentationVariant.sortOrder = answer.orders
	}

	const header = {
		template: ChatLarkMessage.headerTemplate,
		icon: ChatLarkMessage.logoIcon,
		title: {
			tag: 'plain_text',
			content: '分析条件'
		},
		subtitle: {
			// 卡片主标题。必填。
			tag: 'plain_text', // 固定值 plain_text。
			content: answer.preface // 主标题内容。
		},
		text_tag_list: createSlicersTitle(slicers)
	}

	return new Promise((resolve, reject) => {
		chartService.selectResult().subscribe((result) => {
			if (result.error) {
				reject(result.error)
			} else {
				const { card, categoryMembers } =
					answer.visualType === 'Table'
						? createTableMessage(answer, chartAnnotation, context.entityType, result.data, header)
						: chartAnnotation.dimensions?.length > 0
							? createLineChart(answer, chartAnnotation, context.entityType, result.data, header)
							: createKPI(chartAnnotation, context.entityType, result.data, header)
				// console.log(JSON.stringify(card, null, 2))

				if (result.stats?.statements?.[0]) {
					const stats = createStats(result.stats.statements[0])
					card.elements.push(stats as any)
				}
				// console.log(data)
				// larkContext.larkService.interactiveMessage(larkContext, card)
				conversation.done(card)

				resolve({ categoryMembers })
			}
			destroy$.next()
			destroy$.complete()
		})

		chartService.selectResult()

		chartService
			.onAfterServiceInit()
			.pipe(takeUntil(destroy$))
			.subscribe(() => {
				chartService.refresh()
			})

		chartService.slicers = slicers
		chartService.dataSettings = {
			...answer.dataSettings,
			chartAnnotation,
			presentationVariant
		}
	})
}

const colors = [
	'neutral', //中性色
	'blue', //蓝色
	'turquoise', //青绿色
	'lime', //酸橙色
	'orange', //橙色
	'violet', //紫罗兰色
	'indigo', //靛青色
	'wathet', //天蓝色
	'green', //绿色
	'yellow', //黄色
	'red', //红色
	'purple', //紫色
	'carmine' //洋红色
]

export function createSlicersTitle(slicers: ISlicer[]) {
	// console.log(JSON.stringify(slicers, null, 2))
	return slicers.map((slicer) => {
		return {
			tag: 'text_tag',
			text: {
				tag: 'plain_text',
				content: isTimeRangesSlicer(slicer) ? timeRangesSlicerAsString(slicer) : slicerAsString(slicer)
			},
			color: colors[Math.floor(Math.random() * 13)]
		}
	})
}

function createLineChart(
	answer: ChatAnswer,
	chartAnnotation: ChartAnnotation,
	entityType: EntityType,
	data: any[],
	header: any
) {
	const measure = chartAnnotation.measures[0]
	const measureName = getPropertyMeasure(measure)
	// const measureProperty = getEntityProperty(entityType, measure)
	// Empty items data
	// let _data = data.map(() => ({}))

	const chartSpec = {} as any
	let unit = ''
	// let categoryField = 'xField'
	let valueField = 'yField'
	let type = 'bar'
	if (chartAnnotation.chartType?.type === 'Line') {
		type = 'line'
	} else if (chartAnnotation.chartType?.type === 'Pie') {
		type = 'pie'
		// categoryField = 'categoryField'
		valueField = 'valueField'
		chartSpec.outerRadius = 0.9
		chartSpec.innerRadius = 0.3
	}

	let chart_spec = {
		...chartSpec,
		type,
		[valueField]: measureName,
		label: {
			visible: true
		},
		legends: {
			visible: true
		}
	} as any
	let categoryMembers = {}

	// const dimensions = chartAnnotation.dimensions.map((d) => getEntityProperty(entityType, d))
	const nonTimeDimensions = chartAnnotation.dimensions.filter((d) => d.role !== ChartDimensionRoleType.Time)
	let categoryProperty = null
	let seriesProperty = null
	if (chartAnnotation.dimensions.length > 1) {
		const series = getChartSeries(chartAnnotation) || nonTimeDimensions[1] || nonTimeDimensions[0]
		if (!series) {
			throw new Error(
				`Cannot find series dimension in chart dimensions: '${JSON.stringify(chartAnnotation.dimensions)}'`
			)
		}
		const seriesName = getPropertyHierarchy(series)
		seriesProperty = getEntityHierarchy(entityType, seriesName)
		if (!seriesProperty) {
			throw new Error(`Cannot find hierarchy for series dimension '${JSON.stringify(series)}'`)
		}

		categoryProperty = getEntityHierarchy(
			entityType,
			chartAnnotation.dimensions.filter((d) => d.dimension !== series.dimension)[0]
		)
	} else {
		categoryProperty = getEntityHierarchy(entityType, chartAnnotation.dimensions[0])
		if (!categoryProperty) {
			throw new Error(`Not found dimension '${chartAnnotation.dimensions[0].dimension}'`)
		}
	}
	const measures = chartAnnotation.measures.map((m) => getEntityProperty<PropertyMeasure>(entityType, m))
	const baseMeasure = measures.find((m) => m.formatting?.unit !== '%')
	const percentMeasure = measures.find((m) => m.formatting?.unit === '%')

	if (baseMeasure && percentMeasure) {
		const { chartSpec, shortUnit } = createDualAxisChart(
			type,
			categoryProperty.memberCaption || categoryProperty.name,
			baseMeasure,
			percentMeasure,
			data
		)
		chart_spec = chartSpec
		unit = shortUnit
	} else if ((baseMeasure || percentMeasure) && seriesProperty) {
		const { chartSpec, shortUnit } = createSeriesChart(
			type,
			categoryProperty.memberCaption || categoryProperty.name,
			seriesProperty.memberCaption || seriesProperty.name,
			baseMeasure || percentMeasure,
			data
		)
		chart_spec = chartSpec
		unit = shortUnit
	} else if (categoryProperty) {
		const { chartSpec, shortUnit } = createBaseChart(
			type,
			categoryProperty.memberCaption || categoryProperty.name,
			measures,
			data
		)
		chart_spec = chartSpec
		unit = shortUnit
	} else {
		throw Error(`图形配置错误`)
	}

	categoryMembers = {}
	data.forEach((item, index) => {
		if (!categoryMembers[item[categoryProperty.name]]) {
			categoryMembers[item[categoryProperty.name]] = {
				key: item[categoryProperty.name],
				caption: item[categoryProperty.memberCaption]
			}
		}
	})

	return {
		card: {
			elements: [
				{
					tag: 'chart',
					chart_spec: {
						...chart_spec,
						title: {
							text: unit ? `单位：${unit}` : ''
						}
					}
				}
			],
			header
		},
		// data: _data,
		categoryMembers
	}
}

function createKPI(chartAnnotation: ChartAnnotation, entityType: EntityType, data: any[], header: any) {
	const row = data[0]

	const elements = []

	const measures = row
		? chartAnnotation.measures
				.map((measure) => {
					const measureProperty = getEntityProperty<PropertyMeasure>(entityType, measure)
					const rawValue = row[measureProperty.name]
					if (isBlank(rawValue)) {
						return {
							name: measureProperty.caption || measureProperty.name,
							value: 'N/A'
						}
					} else {
						const [value, unit] = formatShortNumber(rawValue, 'zh-Hans')
						const result = formatNumber(value, 'zh-Hans', '0.0-2')
						return {
							name: measureProperty.caption || measureProperty.name,
							value: result,
							unit: measureProperty.formatting?.unit,
							shortUnit: unit
						}
					}
				})
				.forEach(({ name, value, unit, shortUnit }) => {
					elements.push({
						tag: 'markdown',
						content: `**${name}:**`
					})

					elements.push({
						tag: 'markdown',
						content: `**${value}** ${shortUnit || ''}${unit || ''}`,
						text_size: 'heading-1'
					})
				})
		: `**无数据**`

	return {
		card: {
			config: {
				wide_screen_mode: true
			},
			header,
			elements: elements
		},
		data: data,
		categoryMembers: null
	}
}

function createTableMessage(
	answer: ChatAnswer,
	chartAnnotation: ChartAnnotation,
	entityType: EntityType,
	data: any[],
	header: any
) {
	const _data = data.map(() => ({}))

	const columns = [
		...(chartAnnotation.dimensions?.map((dimension) => {
			const hierarchy = getPropertyHierarchy(dimension)
			const property = getEntityHierarchy(entityType, hierarchy)
			const caption = property.memberCaption
			_data.forEach((item, index) => {
				item[caption] = data[index][caption]
			})
			return {
				// 添加列，列的数据类型为不带格式的普通文本。
				name: caption, // 自定义列的标记。必填。用于唯一指定行数据对象数组中，需要将数据填充至这一行的具体哪个单元格中。
				display_name: property.caption, // 列名称。为空时不展示列名称。
				width: 'auto', // 列宽。默认值 auto。
				data_type: 'text', // 列的数据类型。
				horizontal_align: 'left' // 列内数据对齐方式。默认值 left。
			}
		}) ?? []),
		...(chartAnnotation.measures?.map((measure) => {
			const measureName = getPropertyMeasure(measure)
			const property = getEntityProperty<PropertyMeasure>(entityType, measureName)
			_data.forEach((item, index) => {
				if (property.formatting?.unit === '%') {
					item[property.name] = isNil(data[index][property.name])
						? null
						: (data[index][property.name] * 100).toFixed(1)
				} else {
					item[property.name] = isNil(data[index][property.name])
						? null
						: data[index][property.name].toFixed(1)
				}
			})
			return {
				// 添加列，列的数据类型为不带格式的普通文本。
				name: measureName, // 自定义列的标记。必填。用于唯一指定行数据对象数组中，需要将数据填充至这一行的具体哪个单元格中。
				display_name: property.caption, // 列名称。为空时不展示列名称。
				width: 'auto', // 列宽。默认值 auto。
				data_type: 'number', // 列的数据类型。
				horizontal_align: 'right', // 列内数据对齐方式。默认值 left。
				format: {
					// 列的数据类型为 number 时的字段配置。
					precision: 2, // 数字的小数点位数。支持 [0,10] 的整数。默认不限制小数点位数。
					separator: true // 是否生效按千分位逗号分割的数字样式。默认值 false。
				}
			}
		}) ?? [])
	]

	return {
		card: {
			config: {
				wide_screen_mode: true
			},
			header,
			elements: [
				{
					tag: 'table', // 组件的标签。表格组件的固定取值为 table。
					page_size: TABLE_PAGE_SIZE, // 每页最大展示的数据行数。支持[1,10]整数。默认值 5。
					row_height: 'low', // 行高设置。默认值 low。
					header_style: {
						// 在此设置表头。
						text_align: 'left', // 文本对齐方式。默认值 left。
						text_size: 'normal', // 字号。默认值 normal。
						background_style: 'none', // 背景色。默认值 none。
						text_color: 'grey', // 文本颜色。默认值 default。
						bold: true, // 是否加粗。默认值 true。
						lines: 1 // 文本行数。默认值 1。
					},
					columns,
					rows: _data
				}
			]
		},
		data: _data,
		categoryMembers: null
	}
}

function createStats(statement: string) {
	return {
		tag: 'collapsible_panel',
		expanded: false,
		header: {
			template: 'blue',
			title: {
				tag: 'plain_text',
				content: '查询语句'
			},
			vertical_align: 'center',
			icon: {
				tag: 'standard_icon',
				token: 'down-small-ccm_outlined',
				color: 'white',
				size: '16px 16px'
			},
			icon_position: 'right',
			icon_expanded_angle: -180
		},
		vertical_spacing: '8px',
		padding: '8px 8px 8px 8px',
		elements: [
			{
				tag: 'markdown',
				content: `\`\`\`SQL
${statement}
\`\`\``
			}
		]
	}
}
