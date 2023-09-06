import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { TrialUserCreatedEvent } from '../trial.created.event';

@EventsHandler(TrialUserCreatedEvent)
export class TrialUserCreatedHandler
  implements IEventHandler<TrialUserCreatedEvent> {
  handle(event: TrialUserCreatedEvent) {
    console.log('TrialUserCreatedEvent...');
  }
}
