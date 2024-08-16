import { getErrorMessage } from '@metad/server-common'
import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { groupBy } from 'lodash'
import { SemanticModelMemberService } from './member.service'

@Processor('member')
export class MemberProcessor {
	private readonly logger = new Logger(MemberProcessor.name)

	constructor(private readonly memberService: SemanticModelMemberService) {}

	// @Process('seedVectorStore')
	// async handleSeedVectorStore(job: Job<{ modelId: string; organizationId: string }>) {
	// 	const { modelId, organizationId } = job.data
	// 	const { items: members } = await this.memberService.findAll({ where: { modelId } })
	// 	if (members.length) {
	// 		this.logger.debug(`[Job '${job.id}'] Start seed vector store for model '${modelId}' ...`)
	// 		try {
	// 			const cubes = groupBy(members, 'cube')
	// 			for (const [cube, items] of Object.entries<any>(cubes)) {
	// 				const vectorStore = await this.memberService.getVectorStore(modelId, cube)
	// 				if (vectorStore) {
	// 					// const existed = await vectorStore.checkIndexExists()
	// 					// if (!existed) {
	// 					// 	await vectorStore.addMembers(items.filter((member) => member.vector))
	// 					// }
	// 				}
	// 			}

	// 			this.logger.debug(`[Job '${job.id}'] Seed model vector store completed!`)
	// 		} catch (err) {
	// 			await job.moveToFailed(err)
	// 			this.logger.debug(`[Job '${job.id}'] Error!`, getErrorMessage(err))
	// 		}
	// 	}
	// }
}
