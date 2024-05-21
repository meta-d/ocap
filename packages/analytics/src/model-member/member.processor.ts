import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { groupBy } from 'lodash';
import { SemanticModelMemberService } from './member.service';

@Processor('member')
export class MemberProcessor {
  private readonly logger = new Logger(MemberProcessor.name)

  constructor(private readonly memberService: SemanticModelMemberService) { }

  @Process('seedVectorStore')
  async handleSeedVectorStore(job: Job<{ modelId: string; organizationId: string }>) {
    const { modelId, organizationId } = job.data
    this.logger.debug(`Start seed vector store for model '${modelId}' ...`);

    const { items: members } = await this.memberService.findAll({ where: { modelId } })
    const cubes = groupBy(members, 'entity')
    for (const [cube, items] of Object.entries<any>(cubes)) {
      const vectorStore = await this.memberService.getVectorStore(modelId, cube, organizationId)
      if (vectorStore) {
        const existed = await vectorStore.checkIndexExists()
        if (!existed) {
          await vectorStore.addMembers(items.filter((member) => member.vector))
        }
      }
    }

    this.logger.debug(`Seed vector store completed!`);
  }

  @Process('syncMembers')
  async handleSyncMembers(job: Job<{
    modelId: string; organizationId: string;
    entityId: string;
    cube: string; hierarchies: string[]
  }>) {
    const { modelId, entityId, cube, hierarchies } = job.data
    this.logger.debug(`[Job '${job.id}'] Start sync dimension memebrs for model '${modelId}' ...`);

    await this.memberService.syncMembers(modelId, {
      [cube]: {
        entityId,
        hierarchies
      }
    })

    this.logger.debug(`[Job '${job.id}'] End!`)
  }
}