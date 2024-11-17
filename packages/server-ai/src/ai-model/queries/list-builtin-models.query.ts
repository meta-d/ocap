import { IQuery } from '@nestjs/cqrs'

/**
 */
export class ListBuiltinModelsQuery implements IQuery {
	static readonly type = '[AI Model] List builtin models'

	constructor(public readonly provider?: string) {}
}
