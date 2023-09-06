import { ICommand } from '@nestjs/cqrs'
import { CreateSemanticModelDTO } from '../dto/create-model.dto'

export class SemanticModelCreateCommand implements ICommand {
	static readonly type = '[Semantic Model] Create'

	constructor(public readonly input: CreateSemanticModelDTO) {}
}
