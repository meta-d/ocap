import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class StorageFilePublicDTO {
	@Expose()
	id: string

	@Expose()
	url: string

	@Expose()
	originalName: string
	@Expose()
	mimetype: string

	constructor(partial: Partial<StorageFilePublicDTO>) {
		Object.assign(this, partial)
	}
}
