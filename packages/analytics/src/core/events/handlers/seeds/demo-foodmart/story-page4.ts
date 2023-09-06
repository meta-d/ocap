import { Repository } from 'typeorm'
import { StoryWidget } from '../../../../../story-widget/story-widget.entity'

export async function createPage4Widget1(
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
	widget.name = 'Webgl Loader'

	widget.options = {
		key: 'ee12e999-2dc4-4fda-ba05-1f864e6055d4',
		component: 'Iframe',
		dataSettings: { dataSource: '', entitySet: null },
		position: { x: 0, y: 0, rows: 10, cols: 20 },
		options: { src: 'https://threejs.org/examples/webgl_loader_gltf.html' },
		styling: { widget: {} },
		fullscreen: true,
	}

	widget = await repository.save(widget)

	return widget
}
