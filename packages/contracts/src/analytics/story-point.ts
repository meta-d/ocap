import { IStoryWidget } from './story-widget';
import { IBasePerTenantEntityModel } from '../base-entity.model';
import { IStory } from './story';


export interface IStoryPoint extends IBasePerTenantEntityModel {
	key?: string
	name?: string

	storyId: string
	story?: IStory

	options?: Record<string, unknown>

	widgets?: IStoryWidget[]
}
