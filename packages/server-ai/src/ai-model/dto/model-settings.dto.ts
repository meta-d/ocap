

import { Exclude, Expose, Transform, TransformFnParams } from 'class-transformer'


@Expose()
export class ModelSettings {
	

	constructor(partial: Partial<ModelSettings>) {
		Object.assign(this, partial)
	}
}
