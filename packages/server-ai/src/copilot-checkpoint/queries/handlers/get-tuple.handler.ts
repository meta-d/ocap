import { CheckpointTuple, type SerializerProtocol } from '@langchain/langgraph-checkpoint'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CopilotCheckpointSaver } from '../../checkpoint-saver'
import { JsonPlusSerializer } from '../../serde'
import { CopilotCheckpointGetTupleQuery } from '../get-tuple.query'

@QueryHandler(CopilotCheckpointGetTupleQuery)
export class CopilotCheckpointGetTupleHandler implements IQueryHandler<CopilotCheckpointGetTupleQuery> {
	serde: SerializerProtocol = new JsonPlusSerializer()

	constructor(private readonly copilotCheckpointSaver: CopilotCheckpointSaver) {}

	public async execute(command: CopilotCheckpointGetTupleQuery): Promise<CheckpointTuple | undefined> {
		return this.copilotCheckpointSaver.getTuple({ configurable: command.configurable })
	}
}
