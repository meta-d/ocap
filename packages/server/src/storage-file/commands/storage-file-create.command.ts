import { ICommand } from '@nestjs/cqrs';
import { ICreateStorageFileInput } from '@metad/contracts';

export class StorageFileCreateCommand implements ICommand {
	static readonly type = '[StorageFile] Create Storage File';

	constructor(public readonly input: ICreateStorageFileInput) {}
}
