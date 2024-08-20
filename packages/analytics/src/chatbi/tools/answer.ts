import { tool } from '@langchain/core/tools'
import {
	ChartAnnotation,
	ChartBusinessService,
	ChartDimensionRoleType,
	ChartDimensionSchema,
	ChartMeasureSchema,
	DataSettings,
	DataSettingsSchema,
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
	ISlicer,
	isNil,
	isTimeRangesSlicer,
	Measure,
	OrderBy,
	OrderBySchema,
	PresentationVariant,
	PropertyHierarchy,
	PropertyMeasure,
	slicerAsString,
	SlicerSchema,
	TimeRangesSlicer,
	timeRangesSlicerAsString,
	TimeSlicerSchema,
	toAdvancedFilter,
	tryFixDimension,
	tryFixSlicer,
	tryFixVariableSlicer,
	workOutTimeRangeSlicers
} from '@metad/ocap-core'
import { firstValueFrom, Subject, takeUntil } from 'rxjs'
import { z } from 'zod'
import { ChatBILarkContext, ChatContext, IChatBIConversation } from '../types'

type ChatAnswer = {
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

export const ChatAnswerSchema = z.object({
	preface: z.string().describe('preface of the answer'),
	visualType: z.enum(['Chart', 'Table', 'KPI']).describe('Visual type of result'),
	dataSettings: DataSettingsSchema.optional().describe('The data settings of the widget'),
	chartType: z
		.object({
			type: z.enum(['Column', 'Line', 'Pie', 'Bar']).describe('The type of chart')
		})
		.optional()
		.describe('Chart configuration'),
	dimensions: z.array(ChartDimensionSchema).optional().describe('The dimensions used by the chart'),
	measures: z.array(ChartMeasureSchema).optional().describe('The measures used by the chart'),
	orders: z.array(OrderBySchema).optional().describe('The orders used by the chart'),
	top: z.number().optional().describe('The number of top members'),
	slicers: z.array(SlicerSchema).optional().describe('The slicers to filter data'),
	timeSlicers: z.array(TimeSlicerSchema).optional().describe('The time slicers to filter data'),
	variables: z.array(SlicerSchema).optional().describe('The variables to the query of cube'),
	conclusion: z.string().optional().describe('conclusion of the answer')
})

export function createChatAnswerTool(context: ChatContext, larkContext: ChatBILarkContext) {
	const { chatId, logger, dsCoreService, conversation } = context
	return tool(
		async (answer): Promise<string> => {
			logger.debug(`Execute copilot action 'answerQuestion':`, JSON.stringify(answer, null, 2))
			try {
				let entityType = null
				if (answer.dataSettings) {
					// Make sure datasource exists
					const _dataSource = await dsCoreService._getDataSource(answer.dataSettings.dataSource)
					const entity = await firstValueFrom(
						dsCoreService.selectEntitySet(answer.dataSettings.dataSource, answer.dataSettings.entitySet)
					)
					entityType = entity.entityType
				}

				// Fetch data for chart or table or kpi
				if (answer.dimensions?.length || answer.measures?.length) {
					const { data, categoryMembers } = await drawChartMessage(
						{ ...context, entityType: entityType || context.entityType },
						conversation,
						answer as ChatAnswer
					)
					const members = categoryMembers ? JSON.stringify(Object.values(categoryMembers)) : 'Empty'

					return `The analysis data has been displayed to the user. The dimension members involved in this data analysis are:
${members}
For the current data analysis, give more analysis suggestions, 3 will be enough.`
				}

				return `图表答案已经回复给用户了，请不要重复回答了。`
			} catch (err) {
				logger.error(err)
				return `出现错误: ${err}。如果需要用户提供更多信息，请直接提醒用户。`
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
		measures: answer.measures
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
		template: 'blue',
		title: {
			tag: 'plain_text',
			content: '分析条件'
		},
		subtitle: {
			// 卡片主标题。必填。
			tag: 'plain_text', // 固定值 plain_text。
			content: answer.preface, // 主标题内容。
			i18n: {
				// 多语言标题内容。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
				zh_cn: '',
				en_us: '',
				ja_jp: '',
				zh_hk: '',
				zh_tw: ''
			}
		},
		text_tag_list: createSlicersTitle(slicers)
	}

	return new Promise((resolve, reject) => {
		chartService.selectResult().subscribe((result) => {
			if (result.error) {
				reject(result.error)
			} else {
				const { card, data, categoryMembers } =
					answer.visualType === 'Table'
						? createTableMessage(answer, chartAnnotation, context.entityType, result.data, header)
						: chartAnnotation.dimensions?.length > 0
							? createLineChart(answer, chartAnnotation, context.entityType, result.data, header)
							: createKPI(answer, chartAnnotation, context.entityType, result.data, header)
				// console.log(JSON.stringify(card, null, 2))

				if (result.stats?.statements?.[0]) {
					const stats = createStats(result.stats.statements[0])
					card.elements.push(stats as any)
				}
				// console.log(data)
				// larkContext.larkService.interactiveMessage(larkContext, card)
				conversation.answerMessage(card)

				resolve({ data, categoryMembers })
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

function createSlicersTitle(slicers: ISlicer[]) {
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
	const measureProperty = getEntityProperty(entityType, measure)
	// Empty items data
	const _data = data.map(() => ({}))

	const chartSpec = {} as any
	let categoryField = 'xField'
	let valueField = 'yField'
	let type = 'bar'
	if (chartAnnotation.chartType?.type === 'Line') {
		type = 'line'
	} else if (chartAnnotation.chartType?.type === 'Pie') {
		type = 'pie'
		categoryField = 'categoryField'
		valueField = 'valueField'
		chartSpec.outerRadius = 0.9
		chartSpec.innerRadius = 0.3
	}

	const chart_spec = {
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

	let categoryProperty: PropertyHierarchy = null
	const fields = []
	if (chartAnnotation.dimensions?.length > 1) {
		const dimensions = chartAnnotation.dimensions.filter((d) => d.role !== ChartDimensionRoleType.Time)
		const series = getChartSeries(chartAnnotation) || dimensions[1] || dimensions[0]
		const seriesName = getPropertyHierarchy(series)
		const property = getEntityProperty(entityType, seriesName)
		const seriesCaption = property.memberCaption
		chart_spec.seriesField = seriesCaption
		fields.push(seriesCaption)
		categoryProperty = getEntityHierarchy(
			entityType,
			chartAnnotation.dimensions.filter((d) => d.dimension !== series.dimension)[0]
		)
		const categoryCaption = categoryProperty.memberCaption
		chart_spec[categoryField] = categoryCaption
		fields.push(categoryCaption)
	} else if (chartAnnotation.dimensions?.length) {
		categoryProperty = getEntityHierarchy(entityType, chartAnnotation.dimensions[0])
		if (!categoryProperty) {
			throw new Error(`Not found dimension '${chartAnnotation.dimensions[0].dimension}'`)
		}
		const categoryCaption = categoryProperty.memberCaption
		chart_spec[categoryField] = categoryCaption
		fields.push(categoryCaption)
	}

	const categoryMembers = {}
	_data.forEach((item, index) => {
		fields.forEach((field) => (item[field] = data[index][field]))
		if (!categoryMembers[data[index][categoryProperty.name]]) {
			categoryMembers[data[index][categoryProperty.name]] = {
				key: data[index][categoryProperty.name],
				caption: data[index][categoryProperty.memberCaption]
			}
		}
	})

	chartAnnotation.measures?.forEach((measure) => {
		const property = getEntityProperty<PropertyMeasure>(entityType, measure)
		_data.forEach((item, index) => {
			if (property.formatting?.unit === '%') {
				item[property.name] = isNil(data[index][property.name])
					? null
					: (data[index][property.name] * 100).toFixed(1)
			} else {
				item[property.name] = isNil(data[index][property.name]) ? null : data[index][property.name].toFixed(1)
			}
		})
	})

	return {
		card: {
			elements: [
				{
					tag: 'chart',
					chart_spec: {
						...chart_spec,
						data: {
							values: _data // 此处传入数据。
						}
					}
				}
			],
			header
		},
		data: _data,
		categoryMembers
	}
}

function createKPI(
	answer: ChatAnswer,
	chartAnnotation: ChartAnnotation,
	entityType: EntityType,
	data: any[],
	header: any
) {
	const row = data[0]

	const measures = row
		? chartAnnotation.measures
				.map((measure) => {
					const measureProperty = getEntityProperty<PropertyMeasure>(entityType, measure)
					const [value, unit] = formatShortNumber(row[measureProperty.name], 'zh-Hans')
					const result = formatNumber(value, 'zh-Hans', '0.0-2') + unit
					return {
						name: measureProperty.caption || measureProperty.name,
						value: measureProperty.formatting?.unit ? result + measureProperty.formatting.unit : result
					}
				})
				.map(({ name, value }) => `**${name}:** ${value}`)
				.join('\n')
		: `**无数据**`

	return {
		card: {
			config: {
				wide_screen_mode: true
			},
			header,
			elements: [
				{
					tag: 'div',
					text: {
						content: measures,
						tag: 'lark_md'
					}
				}
			]
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
					page_size: 5, // 每页最大展示的数据行数。支持[1,10]整数。默认值 5。
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
