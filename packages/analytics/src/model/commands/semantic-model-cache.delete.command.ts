import { ICommand } from '@nestjs/cqrs';

export class SemanticModelCacheDeleteCommand implements ICommand {
	static readonly type = '[Semantic Model Cache] Delete';

	constructor(public readonly id: string) {}
}
