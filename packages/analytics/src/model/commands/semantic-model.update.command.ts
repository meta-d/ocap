import { ISemanticModel } from '@metad/contracts';
import { ICommand } from '@nestjs/cqrs';

export class SemanticModelUpdateCommand implements ICommand {
	static readonly type = '[Semantic Model] Update';

	constructor(public readonly input: ISemanticModel, public readonly relations?: string[]) {}
}
