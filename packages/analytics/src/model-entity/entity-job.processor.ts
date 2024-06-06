import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Job } from 'bull'
import { SemanticModelMemberService } from '../model-member/member.service'
import { ModelEntityUpdateCommand } from './commands'
import { SemanticModelEntityService } from './entity.service'
import { SemanticModelService } from '../model/model.service'

@Processor('entity')
export class EntityMemberProcessor {
	private readonly logger = new Logger(EntityMemberProcessor.name)

	constructor(
		private readonly entityService: SemanticModelEntityService,
		private readonly memberService: SemanticModelMemberService,
		private readonly modelService: SemanticModelService,
		private readonly commandBus: CommandBus
	) {}

	@Process('syncMembers')
	async handleSyncMembers(
		job: Job<{
			tenantId: string;
			organizationId: string;
			createdById: string;
			modelId: string;
			entityId: string;
			cube: string;
			hierarchies: string[];
		}>
	) {
		const { tenantId, organizationId, createdById, modelId, entityId, cube, hierarchies } = job.data
		this.logger.debug(
			`[Job: entity '${job.id}'] Start sync dimension memebrs for model '${modelId}' and cube '${cube}' ...`
		)

		try {
			const model = await this.modelService.findOne(modelId, { where: {tenantId, organizationId} })
			const cubeMembers = await this.memberService.syncMembers(model.id, {
				[cube]: {
					entityId,
					hierarchies
				},
			}, {createdById})

			// Update job status and sync status of model entity
			await this.commandBus.execute(
				new ModelEntityUpdateCommand({
					id: entityId,
					options: {
						vector: {
							hierarchies
						},
						members: cubeMembers[cube]
					},
					job: {
						id: job.id,
						status: 'completed'
					}
				})
			)

			this.logger.debug(`[Job: entity '${job.id}'] End!`)
		} catch (err) {
			this.entityService.update(entityId, {
				job: {
					id: job.id,
					status: 'failed',
					error: err.message
				}
			})
			await job.moveToFailed(err)
			this.logger.debug(`[Job: entity '${job.id}'] Error!`)
		}
	}
}
