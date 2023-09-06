import { IEventHandler } from '@nestjs/cqrs'
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator'
import { TenantCreatedEvent } from '../tenant.created.event'

@EventsHandler(TenantCreatedEvent)
export class TenantCreatedHandler implements IEventHandler<TenantCreatedEvent>
{
	handle(event: TenantCreatedEvent) {
		console.log('Tenant Created ...')
	}
}
