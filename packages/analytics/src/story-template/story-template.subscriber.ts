import { EntitySubscriberInterface, EventSubscriber, LoadEvent } from 'typeorm'
import { StoryTemplate } from './story-template.entity'

@EventSubscriber()
export class StoryTemplateSubscriber implements EntitySubscriberInterface<StoryTemplate> {
	/**
	 * Indicates that this subscriber only listen to StoryTemplate events.
	 */
	listenTo() {
		return StoryTemplate
	}

	/**
	 * Called after entity is loaded from the database.
	 *
	 * @param entity
	 * @param event
	 */
	afterLoad(entity: StoryTemplate | Partial<StoryTemplate>, event?: LoadEvent<StoryTemplate>): void | Promise<any> {
		try {
			if (entity instanceof StoryTemplate) {
				entity.storyCount = entity.stories?.length ?? 0
                entity.stories = null
			}
		} catch (error) {
			console.log(error)
		}
	}
}
