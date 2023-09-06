import { SharedModule, UserModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { Comment } from './comment.entity'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/comment', module: CommentModule }]),
		forwardRef(() => TypeOrmModule.forFeature([Comment])),
		SharedModule,
		CqrsModule,
		UserModule
	],
	controllers: [CommentController],
	providers: [CommentService],
	exports: [TypeOrmModule, CommentService]
})
export class CommentModule {}
