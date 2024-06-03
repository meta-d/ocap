import { ISemanticModelEntity } from '@metad/contracts';
import { ICommand } from '@nestjs/cqrs';

export class ModelEntityUpdateCommand implements ICommand {
	static readonly type = '[Semantic Model Entity] Update';

	constructor(public readonly input: ISemanticModelEntity) {}
}
