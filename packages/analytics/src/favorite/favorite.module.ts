import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule, TenantModule } from '@metad/server-core';
import { RouterModule } from 'nest-router';
import { FavoriteController } from './favorite.controller';
import { Favorite } from './favorite.entity';
import { FavoriteService } from './favorite.service';
import { CommandHandlers } from './commands/handlers';


@Module({
  imports: [
    RouterModule.forRoutes([
      { path: '/favorite', module: FavoriteModule }
    ]),
    forwardRef(() => TypeOrmModule.forFeature([ Favorite ])),
    forwardRef(() => TenantModule),
    SharedModule,
    CqrsModule,
    
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService, ...CommandHandlers]
})
export class FavoriteModule {}
