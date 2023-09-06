import { Repository } from 'typeorm'
import { StoryWidget } from '../../../../../story-widget/story-widget.entity'

export async function createPage2Widget1(
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
	widget.name = '库存报表'

	widget.options = {
		key: '9f394a30-c64c-48ea-bb57-d0bee4040260',
		component: 'AnalyticalGrid',
		dataSettings: {
			dataSource: 'Demo - FoodMart Model',
			entitySet: 'Inventory',
			lineItemAnnotation: {
				dataFields: [
					{
						name: null,
						dimension: '[Warehouse]',
						hierarchy: '[Warehouse]',
						level: '[Warehouse].[(All)]',
						members: null,
						properties: null,
						label: null,
						displayBehaviour: 'descriptionOnly',
						displayHierarchy: null,
						unbookedData: null,
						zeroSuppression: null,
						formatting: null,
					},
					{
						name: null,
						dimension: '[Store]',
						hierarchy: '[Store]',
						level: '[Store].[(All)]',
						members: null,
						properties: null,
						label: null,
						displayBehaviour: 'descriptionOnly',
						displayHierarchy: null,
						unbookedData: null,
						zeroSuppression: null,
						formatting: null,
					},
					{
						name: null,
						dimension: '[Product]',
						hierarchy: '[Product]',
						level: '[Product].[(All)]',
						members: null,
						properties: null,
						label: null,
						displayBehaviour: 'descriptionOnly',
						displayHierarchy: null,
						unbookedData: null,
						zeroSuppression: null,
						formatting: null,
					},
					{
						name: null,
						dimension: '[Time]',
						hierarchy: '[Time]',
						level: '[Time].[Year]',
						members: null,
						properties: null,
						label: null,
						displayBehaviour: 'descriptionOnly',
						displayHierarchy: null,
						unbookedData: null,
						zeroSuppression: null,
						formatting: null,
					},
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
						zeroSuppression: true,
						formatting: null,
						measure: 'Ordered',
					},
				],
			},
		},
		position: { x: 0, y: 0, rows: 23, cols: 49 },
		options: {
			column: { resizable: true },
			displayDensity: 'compact',
			showToolbar: true,
			allowFiltering: true,
			filterMode: 'excelStyleFilter',
			columns: {
				'[Warehouse]_Text': { styling: {}, groupable: true },
				'[Store]_Text': { styling: {}, groupable: true },
			},
		},
		styling: { widget: {} },
		title: '库存报表',
		index: 0,
	}

	widget = await repository.save(widget)

	return widget
}
