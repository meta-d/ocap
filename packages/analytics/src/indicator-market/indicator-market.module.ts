import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule, TenantModule } from '@metad/server-core';
import { RouterModule } from 'nest-router';
import { IndicatorMarketController } from './indicator-market.controller';
import { IndicatorMarket } from './indicator-market.entity';
import { IndicatorMarketService } from './indicator-market.service';


@Module({
  imports: [
    RouterModule.forRoutes([
      { path: '/indicator-market', module: IndicatorMarketModule }
    ]),
    forwardRef(() => TypeOrmModule.forFeature([ IndicatorMarket ])),
    forwardRef(() => TenantModule),
    SharedModule,
    CqrsModule,
    
  ],
  controllers: [IndicatorMarketController],
  providers: [IndicatorMarketService]
})
export class IndicatorMarketModule {}
