import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { StorageFileUpdateCommand } from '../storage-file-update.command';
import { StorageFileService } from '../../storage-file.service';

@CommandHandler(StorageFileUpdateCommand)
export class StorageFileUpdateHandler
	implements ICommandHandler<StorageFileUpdateCommand> {

	constructor(
		private readonly _fileService: StorageFileService
	) {}

	public async execute(command: StorageFileUpdateCommand): Promise<any> {
		try {
			const { input } = command;
			const { id, file, thumb } = input;

			await this._fileService.update(id, {
				file,
				thumb
			});
			return await this._fileService.findOneByIdString(id);
		} catch (error) {
			throw new BadRequestException('Can\'t update storage file');
		}
	}
}
