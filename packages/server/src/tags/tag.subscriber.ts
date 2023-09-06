import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { RequestContext } from '../core/context/request-context'
import { Tag } from './tag.entity'

@EventSubscriber()
export class TagSubscriber implements EntitySubscriberInterface<Tag> {
	/**
	 * Indicates that this subscriber only listen to Entity events.
	 */
	listenTo() {
		return Tag
	}

	beforeInsert(event: InsertEvent<Tag>): void | Promise<any> {
		if (!event.entity.tenantId) {
			event.entity.tenantId = RequestContext.currentTenantId()
		}
		if (!event.entity.organizationId) {
			event.entity.organizationId = RequestContext.getOrganizationId()
		}
		if (!event.entity.createdById) {
			event.entity.createdById = RequestContext.currentUserId()
		}
	}
}
