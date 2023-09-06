import { IImportHistory } from '@metad/contracts';
import { ICommand } from '@nestjs/cqrs';

export class ImportHistoryCreateCommand implements ICommand {
	static readonly type = '[Create] Import History';

	constructor(
		public readonly input: IImportHistory
	) {}
}