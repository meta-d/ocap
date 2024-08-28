import { IKnowledgeDocument } from '@metad/contracts'
import { InjectQueue } from '@nestjs/bull'
import { Body, Controller, Logger, Post, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Queue } from 'bull'
import { In } from 'typeorm'
import { CrudController } from '../core/crud'
import { TransformInterceptor } from '../core/interceptors'
import { KnowledgeDocument } from './document.entity'
import { KnowledgeDocumentService } from './document.service'

@ApiTags('KnowledgeDocument')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class KnowledgeDocumentController extends CrudController<KnowledgeDocument> {
	readonly #logger = new Logger(KnowledgeDocumentController.name)
	constructor(
		private readonly service: KnowledgeDocumentService,
		private readonly commandBus: CommandBus,
		@InjectQueue('knowledge-document') private docQueue: Queue
	) {
		super(service)
	}

	@Post('bulk')
	async createBulk(@Body() entities: Partial<IKnowledgeDocument>[]) {
		return await this.service.createBulk(entities)
	}

	@Post('process')
	async start(@Body() body: {ids: string[]}) {
		const { items } = await this.service.findAll({
			where: {
				id: In(body.ids)
			}
		})

		const docs = items.filter((doc) => doc.status !== 'running')

		const job = await this.docQueue.add({
			docs
		})
		
		docs.forEach((item) => {
			item.jobId = job.id as string
			item.status = 'running'
			item.processMsg = ''
		})

		return await this.service.save(docs)
	}
}
