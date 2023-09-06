import { cloneDeep } from 'lodash'
import { Repository } from 'typeorm'
import { Indicator } from '../../../../../indicator/indicator.entity'
import { StoryWidget } from '../../../../../story-widget/story-widget.entity'

const indicators = [
	{
		id: '',
		code: 'FEXP0010',
		name: null,
		groupName: null,
		digitsInfo: null,
		digitsUnit: null,
		isItalic: null,
		isUnderline: null,
	},
	{
		code: 'FEXP0011',
		isItalic: true,
		name: null,
		groupName: null,
		digitsInfo: null,
		digitsUnit: null,
		isUnderline: null,
	},
	{
		code: 'FEXP0012',
		isItalic: true,
		cost: false,
		name: null,
		groupName: null,
		digitsInfo: null,
		digitsUnit: null,
	},
	{
		code: 'FEXP0013',
		isItalic: true,
		isUnderline: true,
		name: null,
		groupName: null,
		digitsInfo: null,
		digitsUnit: null,
	},
	{ code: 'FEXP0014', isItalic: true, reverseSemanticColor: true },
	{ code: 'FEXP0015', isItalic: true, reverseSemanticColor: true },
	{ code: 'FEXP0016', isItalic: true, reverseSemanticColor: true },
	{ code: 'FEXP0017', isItalic: true, reverseSemanticColor: true },
]
export const options = {
	key: '5d89b978-7ec3-49ce-8f06-651b712074ae',
	component: 'AccountingStatement',
	dataSettings: {
		dataSource: 'Demo - FoodMart Model',
		entitySet: 'Expense',
	},
	position: { x: 0, y: 15, rows: 13, cols: 24 },
	options: {
		indicators: indicators,
		measures: [
			{ name: 'CURRENT', label: '当期', isRatio: null },
			{ name: 'PYSM', label: '去年同期', isRatio: null },
			{ name: 'YTD', label: '当期累计', isRatio: null },
			{ name: 'YOY', label: '同比', isRatio: true, isSemanticColor: true },
			{ name: 'MOM', label: '环比', isRatio: true, isSemanticColor: true },
		],
		name: '损益表',
		denominator: null,
		unit: '美元',
	},
	styling: { widget: {} },
}

export async function createStoryWidgetAccountingStatement(
	repository: Repository<StoryWidget>,
	indicatorRepository: Repository<Indicator>,
	tenantId: string,
	organizationId: string,
	createdById: string,
	storyId: string,
	pointId: string
) {
	let widget = new StoryWidget()
	widget.tenantId = tenantId
	widget.organizationId = organizationId
	widget.createdById = createdById

	widget.storyId = storyId
	widget.pointId = pointId
	widget.name = '损益表'

	for (const indicator of indicators) {
		indicator.id = (
			await indicatorRepository.findOne({
				where: { tenantId, organizationId, code: indicator.code },
			})
		).id
	}

	widget.options = options
	widget = await repository.save(widget)

	return widget
}

const swiperOptions = {
	key: '5ec33cf0-5340-4321-a3ad-8f5748f674fe',
	component: 'Swiper',
	position: { x: 0, y: 0, rows: 15, cols: 50 },
	options: {
		slides: [
			{
				type: 'IndicatorCard',
				key: '2c8e1321-aa40-4f2f-afe6-ba3d256e021a',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Expense',
					},
					options: {
						disabledYoy: false,
						disabledTrend: false,
						cost: false,
						id: '',
						code: 'FEXP0010',
						indicators: [
							{ disabledYoy: false, code: 'FEXP0011', id: '' },
							{ disabledYoy: false, code: 'FEXP0012' },
							{ disabledYoy: false, code: 'FEXP0013' },
						],
					},
					styling: { widget: {}, swiper: {} },
				}
			},
			{
				type: 'IndicatorCard',
				key: 'd8d9de94-0843-4aeb-bdb5-828abc4a2dee',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Expense',
					},
					options: {
						disabledYoy: false,
						disabledTrend: false,
						cost: false,
						id: '',
						code: 'FEXP0014',
						indicators: [
							{ disabledYoy: false, code: 'FEXP0015', id: '' },
							{ disabledYoy: false, code: 'FEXP0016', id: '' },
							{ disabledYoy: false, code: 'FEXP0017', id: '' },
						],
					},
					styling: { widget: {}, swiper: {} },
				}
			},
			{
				type: 'IndicatorCard',
				key: 'b11e4b51-d9cd-421b-9113-22db5665d4d5',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Inventory',
					},
					options: {
						disabledYoy: false,
						disabledTrend: false,
						cost: false,
						id: '',
						code: 'SCMIN1000',
						indicators: [
							{ disabledYoy: false, code: 'SCMIN1001' },
							{ disabledYoy: false, code: 'SCMIN1002' },
							{ disabledYoy: false, code: 'SCMIN1003' },
						],
					},
					styling: { widget: {}, swiper: {} },
				}
			},
			{
				type: 'IndicatorCard',
				key: 'fbe93811-75e9-4afd-be74-780511e50fd1',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Inventory',
					},
					options: {
						disabledYoy: false,
						disabledTrend: false,
						cost: false,
						id: '',
						code: 'SALST1000',
						indicators: [
							{ disabledYoy: false, code: 'SALST1001' },
							{ disabledYoy: false, code: 'SALST1002' },
							{ disabledYoy: false, code: 'SALST1003' },
						],
					},
					styling: { widget: {}, swiper: {} },
				}
			},
			{
				type: 'IndicatorCard',
				key: '7b7a3024-6a90-44f4-a3f3-a8e08a2971a8',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Inventory',
					},
					options: {
						disabledYoy: false,
						disabledTrend: false,
						cost: false,
						id: '',
						code: 'SALST1003',
						indicators: [
							{ disabledYoy: false, code: 'SALST1004' },
							{ disabledYoy: false, code: 'SALST1005' },
							{ disabledYoy: false, code: 'SALST1006' },
						],
					},
					styling: { widget: {}, swiper: {} },
				}
			},
		],
		slidesPerView: 2,
		spaceBetween: 10,
		breakpoints: [
			{ size: 320, slidesPerView: 1.5, spaceBetween: 10, touchRatio: 1 },
			{ size: 600, slidesPerView: 2.5, spaceBetween: 10, touchRatio: 1 },
			{ size: 1300, slidesPerView: 4.5, spaceBetween: 10, touchRatio: 0 },
		],
		grabCursor: false,
		centeredSlides: false,
		direction: 'horizontal',
		autoplay: false,
		pagination: null,
		width: 200,
	},
	styling: { widget: { height: '340px' }, swiper: {} },
	index: 0,
}

export async function createStoryWidgetSwiper(
	repository: Repository<StoryWidget>,
	indicatorRepository: Repository<Indicator>,
	tenantId: string,
	organizationId: string,
	createdById: string,
	storyId: string,
	pointId: string
) {
	let widget = new StoryWidget()
	widget.tenantId = tenantId
	widget.organizationId = organizationId
	widget.createdById = createdById

	widget.storyId = storyId
	widget.pointId = pointId
	widget.name = '核心指标'

	const options = cloneDeep(swiperOptions)

	for (const indicator of options.options.slides) {
		indicator.options.options.id = (
			await indicatorRepository.findOne({
				where: { tenantId, organizationId, code: indicator.options.options.code },
			})
		).id

		for (const subIndicator of indicator.options.options.indicators) {
			subIndicator.id = (
				await indicatorRepository.findOne({
					where: { tenantId, organizationId, code: subIndicator.code },
				})
			).id
		}
	}

	widget.options = options
	widget = await repository.save(widget)

	return widget
}

const tabsetOptions = {
	key: '86e3ff94-ecd2-47b9-9ceb-3b882ceeead9',
	component: 'TabGroup',
	position: { x: 24, y: 15, rows: 16, cols: 24 },
	options: {
		pagination: {},
		slides: [
			{
				key: 'ce2bbae4-367d-4c7b-be29-1591fb4bc9dd',
				type: 'AccountingStatement',
				title: '公司总库存',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Expense',
					},
					options: {
						measures: [
							{ name: 'CURRENT', label: '当期' },
							{ name: 'YTD', label: '当期累计' },
							{ name: 'MPM', label: '上期' },
							{
								name: 'YOY',
								isRatio: true,
								isSemanticColor: true,
								label: '同比',
							},
							{
								name: 'MOM',
								isRatio: true,
								isSemanticColor: true,
								reverseSemanticColor: false,
								label: '环比',
							},
						],
						indicators: [
							{ code: 'FEXP0014', id: '', groupName: '费用' },
							{
								code: 'FEXP0017',
								reverseSemanticColor: true,
								isUnderline: true,
								isItalic: true,
							},
							{
								code: 'FEXP0011',
								groupName: '利润',
								isItalic: true,
							},
							{ code: 'FEXP0012', isItalic: true },
							{ code: 'FEXP0013', isItalic: true },
							{ code: 'FEXP0010', isUnderline: true },
							{
								code: 'FEXP0015',
								name: '财务费用',
								reverseSemanticColor: true,
							},
							{
								code: 'FEXP0016',
								name: '其他损益项',
								reverseSemanticColor: true,
							},
							{
								code: 'FEXP0017',
								name: '所得税费用',
								reverseSemanticColor: true,
							},
						],
					},
					styling: { widget: {} },
				}
			},
			{
				type: 'AccountingStatement',
				title: '美国门店销售',
				key: '9f285844-2002-4af5-b80e-b6732384c7ca',
				options: {
					dataSettings: {
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Inventory',
					},
					options: {
						indicators: [
							{
								id: '',
								code: 'SCMIN1001',
								reverseSemanticColor: true,
								isItalic: true,
							},
							{
								code: 'SCMIN1002',
								reverseSemanticColor: true,
								isItalic: true,
							},
							{
								code: 'SCMIN1003',
								reverseSemanticColor: true,
								isItalic: true,
							},
							{
								code: 'SCMIN1000',
								isUnderline: true,
								reverseSemanticColor: true,
							},
							{ code: 'SALST1003', isItalic: true },
							{ code: 'SALST1002', isItalic: true },
							{ code: 'SALST1001', isItalic: true },
							{ code: 'SALST1000', isUnderline: true },
						],
						measures: [
							{
								name: 'CURRENT',
								label: '当期',
								isRatio: null,
								isSemanticColor: null,
								reverseSemanticColor: null,
							},
							{
								name: 'MPM',
								label: '上期',
								isRatio: null,
								isSemanticColor: null,
								reverseSemanticColor: null,
							},
							{
								name: 'MOM',
								label: '环比',
								isRatio: true,
								isSemanticColor: null,
								reverseSemanticColor: null,
							},
							{
								name: 'PYSM',
								label: '同期',
								isRatio: null,
								isSemanticColor: null,
								reverseSemanticColor: null,
							},
							{
								name: 'YOY',
								label: '同比',
								isRatio: true,
								isSemanticColor: null,
								reverseSemanticColor: null,
							},
						],
					},
					styling: { widget: { height: '200px' }, swiper: {} },
				}
			},
			{
				type: 'AnalyticalCard',
				title: '地区销售额',
				key: '69bae1e0-afc0-452c-8ebf-603f9f7eb43c',
				options: {
					dataSettings: {
						chartAnnotation: {
							dimensions: [
								{
									name: null,
									dimension: '[Customers]',
									hierarchy: '[Customers]',
									level: '[Customers].[State Province]',
									members: null,
									properties: null,
									label: null,
									displayBehaviour: null,
									displayHierarchy: null,
									unbookedData: null,
									zeroSuppression: null,
									formatting: null,
								},
							],
							measures: [
								{
									name: null,
									dimension: 'Measures',
									hierarchy: null,
									level: null,
									members: null,
									properties: null,
									label: null,
									displayBehaviour: null,
									displayHierarchy: null,
									unbookedData: null,
									zeroSuppression: null,
									formatting: null,
									measure: 'Profit',
									palette: { name: 'PiYG' },
								},
							],
							chartType: { type: 'Bar' },
						},
						dataSource: 'Demo - FoodMart Model',
						entitySet: 'Sales',
					},
					selectionPresentationVariants: {},
					chartSettings: {},
					chartOptions: {},
					styling: { widget: { height: '340px' }, echartsOptions: {} },
				}
			},
			{
				type: 'Tabset',
				title: '品类销售趋势',
				key: '78e3704a-8bbe-4838-aeb2-f2d7fb0db1e7',
				options: {
					options: {
						pagination: null,
						slides: [
							{
								type: 'AnalyticalCard',
								title: '视频',
								key: '86165a47-fb60-4310-8117-43d78ed20f56',
								options: {
									dataSettings: {
										chartAnnotation: {
											dimensions: [
												{
													name: null,
													dimension: '[Time]',
													hierarchy: '[Time]',
													level: '[Time].[Month]',
													members: null,
													properties: null,
													label: null,
													displayBehaviour: null,
													displayHierarchy: null,
													unbookedData: null,
													zeroSuppression: null,
													formatting: null,
												},
											],
											measures: [
												{
													name: null,
													dimension: 'Measures',
													hierarchy: null,
													level: null,
													members: null,
													properties: null,
													label: null,
													displayBehaviour: null,
													displayHierarchy: null,
													unbookedData: null,
													zeroSuppression: null,
													formatting: null,
													measure: 'sales',
												},
											],
											chartType: { type: 'Bar' },
											orient: null,
										},
										dataSource: 'Demo - FoodMart Model',
										entitySet: 'Inventory',
										selectionVariant: {
											selectOptions: [
												{
													members: [{ value: '[Skinner]', label: 'Skinner' }],
													dimension: { dimension: '[Product]' },
												},
											],
										},
									},
									selectionPresentationVariants: {},
									chartSettings: {},
									chartOptions: {},
									styling: { widget: { height: '300px' }, echartsOptions: {} },
								}
							},
							{
								title: '语音',
								type: 'AnalyticalCard',
								key: 'b66d076d-3bf6-4790-ac33-733c9595b2d5',
								options: {
									dataSettings: {
										chartAnnotation: {
											dimensions: [
												{
													name: null,
													dimension: '[Time]',
													hierarchy: '[Time]',
													level: '[Time].[Month]',
													members: null,
													properties: null,
													label: null,
													displayBehaviour: null,
													displayHierarchy: null,
													unbookedData: null,
													zeroSuppression: null,
													formatting: null,
												},
											],
											measures: [
												{
													name: null,
													dimension: 'Measures',
													hierarchy: null,
													level: null,
													members: null,
													properties: null,
													label: null,
													displayBehaviour: null,
													displayHierarchy: null,
													unbookedData: null,
													zeroSuppression: null,
													formatting: null,
													measure: 'sales',
												},
											],
											chartType: { type: 'Bar' },
											orient: null,
										},
										dataSource: 'Demo - FoodMart Model',
										entitySet: 'Inventory',
										selectionVariant: {
											selectOptions: [
												{
													members: [{ value: '[BBB Best]', label: 'BBB Best' }],
													dimension: { dimension: '[Product]' },
												},
											],
										},
									},
									selectionPresentationVariants: {},
									chartSettings: {},
									chartOptions: {},
									styling: { widget: { height: '300px' }, echartsOptions: {} },
								}
							},
							{
								title: '购物',
								type: 'AnalyticalCard',
								key: 'd0404044-e13c-4393-b135-8fa83eddf344',
								options: {
									dataSettings: {
										chartAnnotation: {
											dimensions: [
												{
													name: null,
													dimension: '[Time]',
													hierarchy: '[Time]',
													level: '[Time].[Month]',
													members: null,
													properties: null,
													label: null,
													displayBehaviour: null,
													displayHierarchy: null,
													unbookedData: null,
													zeroSuppression: null,
													formatting: null,
												},
											],
											measures: [
												{
													name: null,
													dimension: 'Measures',
													hierarchy: null,
													level: null,
													members: null,
													properties: null,
													label: null,
													displayBehaviour: null,
													displayHierarchy: null,
													unbookedData: null,
													zeroSuppression: null,
													formatting: null,
													measure: 'sales',
												},
											],
											chartType: { type: 'Bar' },
											orient: null,
										},
										dataSource: 'Demo - FoodMart Model',
										entitySet: 'Inventory',
										selectionVariant: {
											selectOptions: [
												{
													members: [
														{ value: '[Jumbo]', label: 'Jumbo' },
														{ value: '[Kiwi]', label: 'Kiwi' },
														{ value: '[King]', label: 'King' },
														{ value: '[National]', label: 'National' },
													],
													dimension: {
														dimension: '[Product]',
														displayBehaviour: 'descriptionAndId',
													},
												},
											],
										},
									},
									selectionPresentationVariants: {},
									chartSettings: {},
									chartOptions: {},
									styling: { widget: { height: '300px' }, echartsOptions: {} },
								}
							},
						],
					},
					styling: { widget: {}, swiper: {} },
				},
			},
		],
	},
	styling: { widget: {}, swiper: {} },
}

export async function createStoryWidgetTabset(
	repository: Repository<StoryWidget>,
	indicatorRepository: Repository<Indicator>,
	tenantId: string,
	organizationId: string,
	createdById: string,
	storyId: string,
	pointId: string
) {
	let widget = new StoryWidget()
	widget.tenantId = tenantId
	widget.organizationId = organizationId
	widget.createdById = createdById

	widget.storyId = storyId
	widget.pointId = pointId
	widget.name = '指标明细'

	const options = cloneDeep(tabsetOptions)

	for (const slide of options.options.slides) {
		if (slide.type === 'AccountingStatement') {
			for (const indicator of slide.options.options.indicators) {
				indicator.id = (
					await indicatorRepository.findOne({
						where: { tenantId, organizationId, code: indicator.code },
					})
				).id
			}
		}
	}

	widget.options = options
	widget = await repository.save(widget)

	return widget
}
