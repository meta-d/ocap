import { ICommand } from '@nestjs/cqrs';

export class StorageFileDeleteCommand implements ICommand {
	static readonly type = '[StorageFile] Delete Storage File';

	constructor(
		public readonly id: string
	) {}
}
