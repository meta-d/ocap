import { SharedModule, UserModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { CertificationController } from './certification.controller'
import { Certification } from './certification.entity'
import { CertificationService } from './certification.service'
import { QueryHandlers } from './queries/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/certification', module: CertificationModule }]),
		forwardRef(() => TypeOrmModule.forFeature([Certification])),
		SharedModule,
		CqrsModule,
		UserModule,
	],
	controllers: [CertificationController],
	providers: [CertificationService, ...QueryHandlers],
	exports: [TypeOrmModule, CertificationService]
})
export class CertificationModule {}
