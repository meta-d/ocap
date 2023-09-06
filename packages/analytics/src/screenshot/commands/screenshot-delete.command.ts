import { ICommand } from '@nestjs/cqrs';

export class ScreenshotDeleteCommand implements ICommand {
	static readonly type = '[Screenshot] Delete Screenshot';

	constructor(
		public readonly id: string
	) {}
}
