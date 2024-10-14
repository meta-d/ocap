import { convertToUrlPath } from '@metad/server-common'
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { Xpert } from './xpert.entity'

@EventSubscriber()
export class XpertSubscriber implements EntitySubscriberInterface<Xpert> {
	/**
	 * Indicates that this subscriber only listen to Xpert events.
	 */
	listenTo() {
		return Xpert
	}

	beforeInsert(event: InsertEvent<Xpert>): Promise<any> | void {
		if (!event.entity.slug) {
			event.entity.slug = convertToUrlPath(event.entity.name)
		}
	}
}
