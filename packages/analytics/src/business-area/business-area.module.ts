import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from 'nest-router';
import { SharedModule, UserModule } from '@metad/server-core';
import { BusinessAreaService } from './business-area.service';
import { BusinessAreaController } from './business-area.controller';
import { BusinessArea } from './business-area.entity';
import { CommandHandlers } from './commands/handlers';
import { BusinessAreaUserModule } from '../business-area-user/index';

@Module({
  imports: [
    RouterModule.forRoutes([
      { path: '/business-area', module: BusinessAreaModule }
    ]),
    forwardRef(() => TypeOrmModule.forFeature([ BusinessArea ])),
    SharedModule,
    CqrsModule,
    UserModule,
    BusinessAreaUserModule
  ],
  controllers: [
    BusinessAreaController
  ],
  providers: [BusinessAreaService, ...CommandHandlers],
  exports: [TypeOrmModule, BusinessAreaService]
})
export class BusinessAreaModule {}
