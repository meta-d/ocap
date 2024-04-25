import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule, SharedModule, TenantModule } from '@metad/server-core';
import { RouterModule } from '@nestjs/core';
import { NotificationDestinationController } from './notification-destination.controller';
import { NotificationDestination } from './notification-destination.entity';
import { NotificationDestinationService } from './notification-destination.service';
import { RedisModule } from '../core/redis.module';

@Module({
  imports: [
    RouterModule.register([
      { path: '/notification-destination', module: NotificationDestinationModule }
    ]),
    forwardRef(() => TypeOrmModule.forFeature([ NotificationDestination ])),
    forwardRef(() => TenantModule),
    SharedModule,
    CqrsModule,
    EmployeeModule,
    RedisModule
  ],
  providers: [ NotificationDestinationService ],
  controllers: [ NotificationDestinationController ]
})
export class NotificationDestinationModule {}
