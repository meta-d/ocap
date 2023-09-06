import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { ScreenshotService } from './../../../screenshot/screenshot.service';
import { ScreenshotDeleteCommand } from '../screenshot-delete.command';

@CommandHandler(ScreenshotDeleteCommand)
export class ScreenshotDeleteHandler
	implements ICommandHandler<ScreenshotDeleteCommand> {

	constructor(
		private readonly _screenshotService: ScreenshotService
	) {}

	public async execute(command: ScreenshotDeleteCommand): Promise<any> {
		try {
			const { id } = command;
			await this._screenshotService.deleteScreenshot(id)
		} catch (error) {
			throw new BadRequestException('Can\'t delete screenshot');
		}
	}
}
