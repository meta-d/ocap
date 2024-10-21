import { IXpertAgent } from '@metad/contracts'
import { nonNullable } from '@metad/copilot'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { XpertService } from '../../xpert.service'
import { GetXpertAgentQuery } from '../get-xpert-agent.query'

@QueryHandler(GetXpertAgentQuery)
export class GetXpertAgentHandler implements IQueryHandler<GetXpertAgentQuery> {
	constructor(private readonly service: XpertService) {}

	public async execute(command: GetXpertAgentQuery): Promise<IXpertAgent> {
		const { id, agentKey, version } = command
		const xpert = await this.service.findOne(id, {
			relations: ['agent', 'copilotModel', 'agents', 'agents.copilotModel', 'knowledgebases', 'toolsets']
		})

		if (version) {
			//
		} else {
			if (xpert.draft) {
				const draft = xpert.draft
				const agentNode = draft.nodes.find((_) => _.key === agentKey)

				const toolNodes = draft.connections
					.filter((_) => _.type === 'toolset' && _.from === agentKey)
					.map((conn) => draft.nodes.find((_) => _.key === conn.to))
				const subAgents = draft.connections
					.filter((_) => _.type === 'agent' && _.from === agentKey)
					.map((conn) => draft.nodes.find((_) => _.type === 'agent' && _.key === conn.to))
				return {
					...agentNode.entity,
					toolsetIds: toolNodes.filter(nonNullable).map((node) => node.key),
					followers: subAgents.filter(nonNullable).map((node) => node.entity)
				} as IXpertAgent
			}
		}

		return null
	}
}
