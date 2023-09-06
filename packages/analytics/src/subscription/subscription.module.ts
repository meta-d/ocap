import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { EmployeeModule, SharedModule, TenantModule } from '@metad/server-core';
import { RouterModule } from 'nest-router';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './subscription.entity';
import { SubscriptionService } from './subscription.service';


@Module({
  imports: [
    RouterModule.forRoutes([
      { path: '/subscription', module: SubscriptionModule }
    ]),
    forwardRef(() => TypeOrmModule.forFeature([ Subscription ])),
    forwardRef(() => TenantModule),
    SharedModule,
    CqrsModule,
    EmployeeModule
  ],
  providers: [ SubscriptionService ],
  controllers: [ SubscriptionController ]
})
export class SubscriptionModule {}
