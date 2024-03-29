import { TenantModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { CollectionController } from './collection.controller'
import { Collection } from './collection.entity'
import { CollectionService } from './collection.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/collection', module: CollectionModule }]),
		TypeOrmModule.forFeature([Collection]),
		TenantModule,
		CqrsModule
	],
	controllers: [CollectionController],
	providers: [CollectionService],
	exports: [CollectionService]
})
export class CollectionModule {}
