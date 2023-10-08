import { ICommand } from '@nestjs/cqrs';

export class LanguageInitCommand implements ICommand {
	static readonly type = '[Language] Init';

	constructor() {
		//
	}
}
