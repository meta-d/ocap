import { tool } from '@langchain/core/tools'
import {
	ChartAnnotation,
	ChartBusinessService,
	ChartDimensionSchema,
	ChartMeasureSchema,
	DataSettings,
	DataSettingsSchema,
	Dimension,
	EntityType,
	formatNumber,
	formatShortNumber,
	getChartCategory,
	getChartSeries,
	getEntityProperty,
	getPropertyMeasure,
	ISlicer,
	isTimeRangesSlicer,
	Measure,
	OrderBy,
	OrderBySchema,
	PresentationVariant,
	PropertyMeasure,
	slicerAsString,
	SlicerSchema,
	TimeRangesSlicer,
	timeRangesSlicerAsString,
	TimeSlicerSchema,
	tryFixDimension,
	tryFixSlicer,
	tryFixVariableSlicer
} from '@metad/ocap-core'
import { firstValueFrom, Subject, takeUntil } from 'rxjs'
import { z } from 'zod'
import { ChatBILarkContext, ChatContext } from '../types'

type ChatAnswer = {
	preface: string
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
	dataSettings: DataSettingsSchema.optional().describe('The data settings of the widget'),
	chartType: z
		.object({
			type: z.enum(['Column', 'Line', 'Pie', 'Bar', 'Table']).describe('The chart type')
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
	const { chatId, logger, dsCoreService, larkService } = context
	return tool(
		async (answer): Promise<string> => {
			logger.debug(`Execute copilot action 'answerQuestion':`, answer)
			try {
				if (answer.preface) {
					await larkService.textMessage(larkContext, answer.preface)
				}
				let entityType = null
				if (answer.dataSettings) {
					const entity = await firstValueFrom(
						dsCoreService.selectEntitySet(answer.dataSettings.dataSource, answer.dataSettings.entitySet)
					)
					entityType = entity.entityType
				}

				// Fetch data for chart or table or kpi
				if (answer.dimensions?.length || answer.measures?.length) {
					const data = await drawChartMessage(
						{ ...context, entityType: entityType || context.entityType },
						larkContext,
						answer as ChatAnswer
					)

					return `分析数据已经展示给了用户，以下是分析结果的限100条数据，仅供分析，不要重复输出: ${JSON.stringify(data.slice(0, 100))}`
				}

				return `图表答案已经回复给用户了，请不要重复回答了。`
			} catch (err) {
				logger.error(err)

				return `出现错误: ${err}。如果需要用户提供更多信息，请直接提醒用户。`
				// try {
				// 	const result = await firstValueFrom(larkService.action({
				// 		data: {
				// 			receive_id: chatId,
				// 			content: JSON.stringify({text: err}),
				// 			msg_type: 'text'
				// 		},
				// 		params: {
				// 			receive_id_type: 'chat_id'
				// 		}
				// 	}))

				// 	logger.debug(`Error action 有回复:`, result)
				// } catch(err) {
				// 	console.error(`绝不应该出现的错误：`, err)
				// 	return `出现未知错误，请结束对话`
				// }
			}
		},
		{
			name: 'answerQuestion',
			description: 'Create chart answer for the question',
			schema: ChatAnswerSchema
		}
	)
}

async function drawChartMessage(
	context: ChatContext,
	larkContext: ChatBILarkContext,
	answer: ChatAnswer
): Promise<any[]> {
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

	const presentationVariant: PresentationVariant = {}
	if (answer.top) {
		presentationVariant.maxItems = answer.top
	}
	if (answer.orders) {
		presentationVariant.sortOrder = answer.orders
	}

	slicers.push(...(answer.timeSlicers ?? []))

	const title = createSlicersTitle(slicers)

	return new Promise((resolve, reject) => {
		chartService.selectResult().subscribe((result) => {
			if (result.error) {
				reject(result.error)
			} else {
				larkContext.larkService.interactiveMessage(
					larkContext,
					chartAnnotation.chartType?.type === 'Table'
						? createTableMessage(answer, chartAnnotation, context.entityType, result.data, title)
						: chartAnnotation.dimensions?.length > 0
							? createLineChart(chartAnnotation, context.entityType, result.data, title)
							: createKPI(answer, chartAnnotation, context.entityType, result.data, title)
				)
				resolve(result.data)
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

function createLineChart(chartAnnotation: ChartAnnotation, entityType: EntityType, data: any[], tags: any[]) {
	const measure = chartAnnotation.measures[0]
	const measureName = getPropertyMeasure(measure)
	const measureProperty = getEntityProperty(entityType, measure)

	let type = 'bar'
	if (chartAnnotation.chartType?.type === 'Line') {
		type = 'line'
	} else if (chartAnnotation.chartType?.type === 'Pie') {
		type = 'pie'
	}

	const chart_spec = {
		type,
		data: {
			values: data // 此处传入数据。
		},
		yField: measureName,
		label: {
			visible: true
		},
		legends: {
			visible: true
		}
	} as any

	if (chartAnnotation.dimensions?.length > 1) {
		const series = getChartSeries(chartAnnotation) || chartAnnotation.dimensions[1]
		chart_spec.seriesField = series.hierarchy
		chart_spec.xField = chartAnnotation.dimensions.filter((d) => d.dimension !== series.dimension)[0]?.hierarchy
	} else {
		chart_spec.xField = getChartCategory(chartAnnotation)?.hierarchy
	}

	return {
		elements: [
			{
				tag: 'chart',
				chart_spec
			}
		],
		header: {
			template: 'blue',
			title: {
				// 卡片主标题。必填。
				tag: 'plain_text', // 固定值 plain_text。
				content: '分析结果', // 主标题内容。
				i18n: {
					// 多语言标题内容。必须配置 content 或 i18n 两个属性的其中一个。如果同时配置仅生效 i18n。
					zh_cn: '',
					en_us: '',
					ja_jp: '',
					zh_hk: '',
					zh_tw: ''
				}
			},
			text_tag_list: tags
		}
	}
}

function createKPI(
	answer: ChatAnswer,
	chartAnnotation: ChartAnnotation,
	entityType: EntityType,
	data: any[],
	tags: any[]
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
		config: {
			wide_screen_mode: true
		},
		header: {
			title: {
				tag: 'plain_text',
				content: answer.preface
			},
			template: 'blue',
			text_tag_list: tags
		},
		elements: [
			{
				tag: 'div',
				text: {
					content: measures,
					tag: 'lark_md'
				}
			}
		]
	}
}

function createTableMessage(
	answer: ChatAnswer,
	chartAnnotation: ChartAnnotation,
	entityType: EntityType,
	data: any[],
	tags: any[]
) {
	return {
		config: {
			wide_screen_mode: true
		},
		header: {
			title: {
				tag: 'plain_text',
				content: answer.preface
			},
			template: 'blue',
			text_tag_list: tags
		},
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
				columns: [
					// 在此添加列。最多支持添加 50 列，超出 50 列的内容不展示。
					{
						// 添加列，列的数据类型为不带格式的普通文本。
						name: 'customer_name', // 自定义列的标记。必填。用于唯一指定行数据对象数组中，需要将数据填充至这一行的具体哪个单元格中。
						display_name: '客户名称', // 列名称。为空时不展示列名称。
						width: 'auto', // 列宽。默认值 auto。
						data_type: 'text', // 列的数据类型。
						horizontal_align: 'left' // 列内数据对齐方式。默认值 left。
					},
					{
						// 添加列，列的数据类型为 lark_md 文本。
						name: 'customer_link',
						display_name: '相关链接',
						data_type: 'lark_md'
					},
					{
						// 添加类型为数字的列。
						name: 'customer_arr',
						display_name: 'ARR(万元)',
						data_type: 'number',
						format: {
							// 列的数据类型为 number 时的字段配置。
							symbol: '¥', // 数字前展示的货币单位。支持 1 个字符的货币单位文本。可选。
							precision: 2, // 数字的小数点位数。支持 [0,10] 的整数。默认不限制小数点位数。
							separator: true // 是否生效按千分位逗号分割的数字样式。默认值 false。
						},
						width: '120px'
					},
					{
						// 添加类型为选项的列。
						name: 'customer_scale',
						display_name: '客户规模',
						data_type: 'options'
					},
					{
						// 添加类型为人员的列。
						name: 'customer_poc',
						display_name: '客户对接人',
						data_type: 'persons'
					},
					{
						// 添加类型为日期的列。
						name: 'meeting_date',
						display_name: '对接时间',
						data_type: 'date',
						date_format: 'YYYY/MM/DD'
					},
					{
						// 添加类型为 markdown 文本的列。
						name: 'company_image',
						display_name: '企业图片',
						data_type: 'markdown'
					}
				],
				rows: [
					// 在此添加与列定义对应的行数据。用 "name":VALUE 的形式，定义每一行的数据内容。name 即你自定义的列标记。
					{
						customer_name: '飞书科技',
						customer_date: 1699341315000,
						customer_scale: [
							{
								text: 'S2',
								color: 'blue'
							}
						],
						customer_arr: 168,
						customer_poc: ['ou_14a32f1a02e64944cf19207aa43abcef', 'ou_e393cf9c22e6e617a4332210d2aabcef'],
						customer_link:
							'[飞书科技](/ssl:ttdoc/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)'
					},
					{
						customer_name: '飞书科技_01',
						customer_date: 1606101072000,
						customer_scale: [
							{
								text: 'S1',
								color: 'red'
							}
						],
						customer_arr: 168.23,
						customer_poc: 'ou_14a32f1a02e64944cf19207aa43abcef',
						customer_link:
							'[飞书科技_01](/ssl:ttdoc/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)',
						company_image: '![image.png](image_key)'
					},
					{
						customer_name: '飞书科技_02',
						customer_date: 1606101072000,
						customer_scale: [
							{
								text: 'S3',
								color: 'orange'
							}
						],
						customer_arr: 168.23,
						customer_poc: 'ou_14a32f1a02e64944cf19207aa43abcef',
						customer_link:
							'[飞书科技_02](/ssl:ttdoc/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)',
						company_image: '![image.png](image_key)'
					},
					{
						customer_name: '飞书科技_03',
						customer_date: 1606101072000,
						customer_scale: [
							{
								text: 'S2',
								color: 'blue'
							}
						],
						customer_arr: 168.23,
						customer_poc: 'ou_14a32f1a02e64944cf19207aa43abcef',
						customer_link:
							'[飞书科技_03](/ssl:ttdoc/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)',
						company_image: '![image.png](image_key)'
					}
				]
			}
		]
	}
}
