import { EntitySubscriberInterface, EventSubscriber } from 'typeorm'
import { XpertToolset } from './xpert-toolset.entity'

@EventSubscriber()
export class XpertToolsetSubscriber implements EntitySubscriberInterface<XpertToolset> {
	/**
	 * Indicates that this subscriber only listen to Xpert tool events.
	 */
	listenTo() {
		return XpertToolset
	}

	// async afterLoad(entity: XpertToolset, event?: LoadEvent<XpertToolset>): Promise<any> {
	// 	if (entity.category === XpertToolsetCategoryEnum.BUILTIN) {
	// 		const providers = await this.queryBus.execute(new ListBuiltinToolProvidersQuery([entity.type]))
	// 		if (providers[0]) {
	// 			entity.tags = providers[0].identity.tags?.map((name) => ({name}))
	// 		}
	// 	}
	// }
}
