import { ScreenshotSubscriber, StoryPointSubscriber, StoryTemplateSubscriber, StoryWidgetSubscriber } from './internal'

/**
 * A map of the core TypeORM Subscribers.
 */
export const coreSubscribers = [
	ScreenshotSubscriber,
	StoryTemplateSubscriber,
	StoryPointSubscriber,
	StoryWidgetSubscriber
]
