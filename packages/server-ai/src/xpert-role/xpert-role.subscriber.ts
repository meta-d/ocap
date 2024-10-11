import { convertToUrlPath } from '@metad/server-common'
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { XpertRole } from './xpert-role.entity'

@EventSubscriber()
export class XpertRoleSubscriber implements EntitySubscriberInterface<XpertRole> {
	/**
	 * Indicates that this subscriber only listen to StorageFile events.
	 */
	listenTo() {
		return XpertRole
	}

	beforeInsert(event: InsertEvent<XpertRole>): Promise<any> | void {
		if (!event.entity.name) {
			event.entity.name = convertToUrlPath(event.entity.title)
		}
	}
}
