import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IPagination } from '@metad/contracts'
import { CrudController, ParseJsonPipe } from '@metad/server-core'
import { DeepPartial, FindManyOptions } from 'typeorm'
import { SemanticModelMember } from './member.entity'
import { SemanticModelMemberService } from './member.service'

@ApiTags('SemanticModelMember')
@ApiBearerAuth()
@Controller()
export class ModelMemberController extends CrudController<SemanticModelMember> {
	constructor(
		private readonly memberService: SemanticModelMemberService,
		private readonly commandBus: CommandBus
	) {
		super(memberService)
	}

	@Get()
	async findAll(
		@Query('$query', ParseJsonPipe) query: FindManyOptions
	): Promise<IPagination<SemanticModelMember>> {
		const { relations, where } = query
		return await this.memberService.findAll({
			where,
			relations,
		})
	}

	@HttpCode(HttpStatus.CREATED)
	@Post()
	async bulkCreate(
		@Body() members: DeepPartial<SemanticModelMember[]>,
		...options: any[]
	) {
		return this.memberService.bulkCreate(members)
	}

	@HttpCode(HttpStatus.OK)
	@Delete()
	async bulkDelete(
		@Query('$query', ParseJsonPipe) query: FindManyOptions,
		...options: any[]
	) {
		return this.memberService.bulkDelete(query)
	}
}
