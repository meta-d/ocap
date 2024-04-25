import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { SharedModule, TenantModule } from '@metad/server-core'
import { RouterModule } from '@nestjs/core'
import { InsightModel } from './insight-model.entity'
import { InsightController } from './insight.controller'
import { InsightService } from './insight.service'

@Module({
	imports: [
		RouterModule.register([{ path: '/insight', module: InsightModule }]),
		forwardRef(() => TypeOrmModule.forFeature([InsightModel])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		ClientsModule.register([
			{
				name: 'AI_SERVICE',
				transport: Transport.TCP,
				options: {
					host: 'localhost',
        			port: 5000
				}
			},
		]),
	  
	],
	controllers: [InsightController],
	providers: [InsightService],
})
export class InsightModule {}
