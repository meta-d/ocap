import { Exclude, Expose } from 'class-transformer'

@Expose()
export class PublicAIModelDto {

	@Exclude()
	parameter_rules: any
    
	@Exclude()
	pricing: any

	constructor(partial: Partial<PublicAIModelDto>) {
		Object.assign(this, partial)
	}
}
