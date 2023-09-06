import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { StorageFile } from './storage-file.entity'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { IStorageFile } from '@metad/contracts'

@Injectable()
export class StorageFileService extends TenantOrganizationAwareCrudService<StorageFile> {
	constructor(
		@InjectRepository(StorageFile)
		protected readonly fileRepository: Repository<StorageFile>
	) {
		super(fileRepository)
	}

	/**
	 * DELETE file by ID
	 *
	 * @param criteria
	 * @param options
	 * @returns
	 */
	async deleteStorageFile(id: IStorageFile['id']): Promise<IStorageFile> {
		try {
			// 为了正确触发 StorageFileSubscriber 的 afterRemove 事件参数中的 entity
			const entity = await this.findOne(id)
			return await this.repository.remove(entity)
		} catch (error) {
			throw new ForbiddenException()
		}
	}
}
