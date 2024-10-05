import { IKnowledgebase } from '@metad/contracts';
import { ICommand } from '@nestjs/cqrs';

export class KnowledgebaseClearCommand implements ICommand {
	static readonly type = '[Knowledgebase] Clear';

	constructor(public readonly input: { entity: IKnowledgebase }) {}
}
