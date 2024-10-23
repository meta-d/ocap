import { RequestContext } from '@metad/server-core'
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { XpertTool } from './xpert-tool.entity'

@EventSubscriber()
export class XpertToolSubscriber implements EntitySubscriberInterface<XpertTool> {
	/**
	 * Indicates that this subscriber only listen to Xpert tool events.
	 */
	listenTo() {
		return XpertTool
	}

	beforeInsert(event: InsertEvent<XpertTool>): Promise<any> | void {
		if (event.entity) {
			event.entity.tenantId ??= RequestContext.currentTenantId()
			event.entity.organizationId ??= RequestContext.getOrganizationId()
		}
	}
}
