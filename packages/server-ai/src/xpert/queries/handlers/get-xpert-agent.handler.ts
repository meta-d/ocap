import { IXpertAgent } from '@metad/contracts'
import { nonNullable } from '@metad/copilot'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { XpertService } from '../../xpert.service'
import { GetXpertAgentQuery } from '../get-xpert-agent.query'
import { pick } from '@metad/server-common'

@QueryHandler(GetXpertAgentQuery)
export class GetXpertAgentHandler implements IQueryHandler<GetXpertAgentQuery> {
	constructor(private readonly service: XpertService) {}

	public async execute(command: GetXpertAgentQuery): Promise<IXpertAgent> {
		const { id, agentKey, draft } = command
		const xpert = await this.service.findOne(id, {
			relations: ['agent', 'copilotModel', 'agents', 'agents.copilotModel', 'knowledgebases', 'toolsets', 'executors']
		})

		if (draft && xpert.draft) {
			const draft = xpert.draft
			const agentNode = draft.nodes.find((_) => _.key === agentKey)

			const toolNodes = draft.connections
				.filter((_) => _.type === 'toolset' && _.from === agentKey)
				.map((conn) => draft.nodes.find((_) => _.key === conn.to))
			const subAgents = draft.connections
				.filter((_) => _.type === 'agent' && _.from === agentKey)
				.map((conn) => draft.nodes.find((_) => _.type === 'agent' && _.key === conn.to))
			const collaborators = draft.connections
				.filter((_) => _.type === 'xpert' && _.from === agentKey)
				.map((conn) => draft.nodes.find((_) => _.type === 'xpert' && _.key === conn.to))
			return {
				...agentNode.entity,
				toolsetIds: toolNodes.filter(nonNullable).map((node) => node.key),
				followers: subAgents.filter(nonNullable).map((node) => node.entity),
				collaborators: collaborators.filter(nonNullable).map((node) => node.entity),
				team: {
					...draft.team,
					...pick(xpert, 'id', 'tenantId', 'organizationId')
				}
			} as IXpertAgent
		} else {
			const agents = [xpert.agent, ...xpert.agents]
			const agent = agentKey ? agents.find((_) => _.key === agentKey) : xpert.agent
			if (agent) {
				return {
					...agent,
					followers: [xpert.agent, ...xpert.agents].filter((_) => _.leaderKey === agent.key),
					collaborators: agent.collaboratorNames.map((name) => xpert.executors.find((_) => _.name === name)).filter(nonNullable),
					team: xpert
				}
			}
		}

		return null
	}
}
