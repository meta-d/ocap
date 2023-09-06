import { Repository } from 'typeorm'
import { StoryWidget } from '../../../../../story-widget/story-widget.entity'

export const page3Name = '库存看板'
export const page3Options = {
	key: '997b6d73-766f-4768-a0f3-01566c321d2f',
	type: 1,
	index: 3,
	gridOptions: {
		gridType: 'fixed',
		setGridSize: true,
		fixedColWidth: 15,
		fixedRowHeight: 15,
		compactType: 'compactUp',
		displayGrid: 'always',
	},
	filterBar: null,
	styling: { canvas: {}, pageSize: {} },
}

export async function createPage3FilterBar(
	repository: Repository<StoryWidget>,
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
	widget.name = '过滤器栏'

	widget.options = {
		key: '4e92750d-3987-48f6-8c0d-7455f626d655',
		index: 0,
		component: 'AntD/FilterBar',
		dataSettings: {
			dataSource: 'Demo - FoodMart Model',
			entitySet: 'Inventory',
			selectionFieldsAnnotation: {
				propertyPaths: [
					{
						name: null,
						dimension: '[Warehouse]',
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
					},
					{
						name: null,
						dimension: '[Store]',
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
					},
					{
						name: null,
						dimension: '[Product]',
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
					},
				],
			},
		},
		position: { x: 0, y: 0, rows: 4, cols: 40 },
		options: {
			today: {},
			filters: {
				'[Product]': {
					typeAhead: {},
					styling: {},
					allowedExpressions: 'MultiValue',
				},
			},
			liveMode: true,
		},
		styling: { widget: {} },
	}

	widget = await repository.save(widget)

	return widget
}

export async function createPage3Widget1(
	repository: Repository<StoryWidget>,
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
	widget.name = '发货量趋势'

	widget.options = {
		index: 1,
		key: '3e8f65b5-f978-45a8-bd4a-8258b27788ac',
		component: 'AnalyticalCard',
		dataSettings: {
			dataSource: 'Demo - FoodMart Model',
			entitySet: 'Inventory',
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
						zeroSuppression: true,
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
						measure: 'Shipped',
						palette: { name: 'PiYG' },
					},
				],
				chartType: { type: 'Line' },
			},
		},
		position: { x: 12, y: 4, rows: 14, cols: 28 },
		chartSettings: {},
		chartOptions: {},
		styling: { widget: { height: '335px' }, echartsOptions: {} },
		title: '发货量趋势',
	}

	widget = await repository.save(widget)

	return widget
}

export async function createPage3Widget2(
	repository: Repository<StoryWidget>,
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
	widget.name = '品牌占比'

	widget.options = {
		index: 2,
		key: 'a0e63e36-ad11-4bf2-a884-b75009f5b960',
		component: 'AnalyticalCard',
		dataSettings: {
			dataSource: 'Demo - FoodMart Model',
			entitySet: 'Inventory',
			chartAnnotation: {
				dimensions: [
					{
						name: null,
						dimension: '[Product]',
						hierarchy: '[Product]',
						level: '[Product].[Brand Name]',
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
						measure: 'Shipped',
					},
				],
				chartType: { type: 'Donut' },
			},
			selectionVariant: {},
			presentationVariant: {
				groupBy: [],
				sortOrder: [{ by: 'Ordered', order: 'DESC' }],
			},
		},
		position: { x: 0, y: 4, rows: 14, cols: 12 },
		chartSettings: {},
		chartOptions: {},
		styling: {
			widget: { height: '330px' },
			echartsOptions: { legend: [{ type: 'scroll', left: 8 }] },
		},
		title: '品牌占比',
	}

	widget = await repository.save(widget)

	return widget
}

export async function createPage3Widget3(
	repository: Repository<StoryWidget>,
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
	widget.name = '发货量趋势'

	widget.options = {
		index: 3,
		key: 'd6e58e1c-d284-43ff-962c-03981c91ee83',
		component: 'AnalyticalCard',
		dataSettings: {
			dataSource: 'Demo - FoodMart Model',
			entitySet: 'Inventory',
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
						zeroSuppression: true,
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
						measure: 'Shipped',
						palette: { name: 'PiYG' },
					},
				],
				chartType: { type: 'Line' },
			},
		},
		position: { x: 0, y: 18, rows: 11, cols: 21 },
		chartSettings: {},
		chartOptions: {},
		styling: { widget: { height: '260px' }, echartsOptions: {} },
		selectionPresentationVariants: null,
		title: '发货量趋势',
	}

	widget = await repository.save(widget)

	return widget
}
