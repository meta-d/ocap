import { Exclude, Expose, Transform, TransformFnParams } from 'class-transformer'

@Expose()
export class ModelWithProviderEntity {
	

	constructor(partial: Partial<ModelWithProviderEntity>) {
		Object.assign(this, partial)
	}
}
