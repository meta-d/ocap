import { Repository } from 'typeorm'
import { StoryPoint, StoryWidget } from '../../../entities/internal'

export async function createWidget(
	repository: Repository<StoryWidget>,
	page: StoryPoint,
	name: string,
	options: any
) {
	let widget = new StoryWidget()
	widget.tenantId = page.tenantId
	widget.organizationId = page.organizationId
	widget.createdById = page.createdById

	widget.storyId = page.storyId
	widget.pointId = page.id
	widget.name = name

	widget.options = options

	widget = await repository.save(widget)

	return widget
}
