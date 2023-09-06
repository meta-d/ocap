import { ICommand } from '@nestjs/cqrs';
import { IUpdateScreenshotInput } from '@metad/contracts';

export class ScreenshotUpdateCommand implements ICommand {
	static readonly type = '[Screenshot] Update Screenshot';

	constructor(
		public readonly input: IUpdateScreenshotInput
	) {}
}
