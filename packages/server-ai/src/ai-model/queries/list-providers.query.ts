import { IQuery } from '@nestjs/cqrs'

/**
 */
export class ListModelProvidersQuery implements IQuery {
	static readonly type = '[AI Model] List Providers'

	constructor() {
		//
	}
}
