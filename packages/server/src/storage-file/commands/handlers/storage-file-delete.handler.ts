import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { StorageFileDeleteCommand } from '../storage-file-delete.command';
import { StorageFileService } from '../../storage-file.service';

@CommandHandler(StorageFileDeleteCommand)
export class StorageFileDeleteHandler
	implements ICommandHandler<StorageFileDeleteCommand> {

	constructor(
		private readonly fileService: StorageFileService
	) {}

	public async execute(command: StorageFileDeleteCommand): Promise<any> {
		try {
			const { id } = command;
			await this.fileService.delete(id)
		} catch (error) {
			throw new BadRequestException('Can\'t delete storage file');
		}
	}
}
