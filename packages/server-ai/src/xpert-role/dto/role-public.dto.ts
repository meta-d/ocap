import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { Knowledgebase, XpertToolset } from '../../core/entities/internal'
import { ToolsetPublicDTO } from '../../xpert-toolset/dto'
import { XpertRole } from '../xpert-role.entity'
import { KnowledgebasePublicDTO } from '../../knowledgebase/dto'


@Expose()
export class XpertRolePublicDTO extends XpertRole {

	@Transform((params: TransformFnParams) =>
		params.value ? params.value.map((item) => new KnowledgebasePublicDTO(item)) : null
	)
	declare knowledgebases?: Knowledgebase[]

	@Transform((params: TransformFnParams) =>
		params.value ? params.value.map((item) => new ToolsetPublicDTO(item)) : null
	)
	declare toolsets?: XpertToolset[]

	constructor(partial: Partial<XpertRolePublicDTO>) {
		super()
		Object.assign(this, partial)
	}
}
