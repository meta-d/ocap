import { TXpertTeamDraft } from '@metad/contracts'
import { Exclude, Expose, Transform, TransformFnParams } from 'class-transformer'
import { Knowledgebase, XpertToolset } from '../../core/entities/internal'
import { KnowledgebasePublicDTO } from '../../knowledgebase/dto'
import { ToolsetPublicDTO } from '../../xpert-toolset/dto'
import { XpertRole } from '../xpert-role.entity'

@Expose()
export class XpertRolePublicDTO extends XpertRole {
	@Exclude()
	declare draft?: TXpertTeamDraft

	@Transform((params: TransformFnParams) =>
		params.value ? params.value.map((item) => new KnowledgebasePublicDTO(item)) : null
	)
	declare knowledgebases?: Knowledgebase[]

	@Transform((params: TransformFnParams) =>
		params.value ? params.value.map((item) => new ToolsetPublicDTO(item)) : null
	)
	declare toolsets?: XpertToolset[]

	constructor(partial: Partial<XpertRolePublicDTO | XpertRole>) {
		super()
		Object.assign(this, partial)
	}
}
