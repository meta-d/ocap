import { IPagination } from '@metad/contracts'
import { CrudController, ParseJsonPipe, UUIDValidationPipe } from '@metad/server-core'
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { DeepPartial, FindManyOptions } from 'typeorm'
import { SemanticModelMember } from './member.entity'
import { SemanticModelMemberService } from './member.service'

@ApiTags('SemanticModelMember')
@ApiBearerAuth()
@Controller()
export class ModelMemberController extends CrudController<SemanticModelMember> {
	constructor(private readonly memberService: SemanticModelMemberService, private readonly commandBus: CommandBus) {
		super(memberService)
	}

	@Get(':id')
	async findAllMembers(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('$query', ParseJsonPipe) query: FindManyOptions
	): Promise<IPagination<SemanticModelMember>> {
		const { relations, where } = query
		return await this.memberService.findAll({
			where,
			relations
		})
	}

	@HttpCode(HttpStatus.CREATED)
	@Post(':id')
	async bulkCreate(@Param('id', UUIDValidationPipe) id: string, @Body() members: DeepPartial<SemanticModelMember[]>) {
		return this.memberService.bulkCreate(id, members)
	}

	@HttpCode(HttpStatus.OK)
	@Delete(':id')
	async bulkDelete(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('$query', ParseJsonPipe) query: FindManyOptions
	) {
		return this.memberService.bulkDelete(id, query)
	}
}
