import { ICommand } from '@nestjs/cqrs';
import { IImportRecordFind } from '@metad/contracts';

export class ImportRecordFindOrFailCommand implements ICommand {
	static readonly type = '[Find Or Fail] Import Record';

	constructor(
		public readonly input: IImportRecordFind | IImportRecordFind[]
	) {}
}