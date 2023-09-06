import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule, SharedModule, TagModule, TenantModule } from '@metad/server-core';
import { RouterModule } from 'nest-router';
import { IndicatorController } from './indicator.controller';
import { Indicator } from './indicator.entity';
import { IndicatorService } from './indicator.service';
import { BusinessAreaUserModule } from '../business-area-user/index';
import { QueryHandlers } from './queries/handlers';
import { CommandHandlers } from './commands/handlers';

@Module({
  imports: [
    RouterModule.forRoutes([
      { path: '/indicator', module: IndicatorModule }
    ]),
    forwardRef(() => TypeOrmModule.forFeature([ Indicator ])),
    TenantModule,
    SharedModule,
    CqrsModule,
    EmployeeModule,
    BusinessAreaUserModule,
    TagModule
  ],
  controllers: [IndicatorController],
  providers: [IndicatorService, ...QueryHandlers, ...CommandHandlers],
  exports: [TypeOrmModule, IndicatorService]
})
export class IndicatorModule {}
