import {
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	HttpStatus,
	HttpCode,
	Query
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IPagination } from '@metad/contracts';
import { DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from '../entities/internal';
import { ICrudService } from './icrud.service';
import { OptionsSelect, PaginationParams } from './pagination-params';
import { ParseJsonPipe, UUIDValidationPipe } from './../../shared/pipes';
import { isNil, omitBy } from 'lodash';

@ApiResponse({ 
	status: HttpStatus.UNAUTHORIZED,
	description: 'Unauthorized'
})
@ApiResponse({
	status: HttpStatus.FORBIDDEN,
	description: 'Forbidden'
})
@ApiBearerAuth()
export abstract class CrudController<T extends BaseEntity> {
	protected constructor(private readonly crudService: ICrudService<T>) {}

	@ApiOperation({ summary: 'Find all records counts' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found records count'
	})
	@Get('count')
    async getCount(
		filter?: PaginationParams<T>
	): Promise<number | void> {
        return await this.crudService.count(filter);
    }

	@ApiOperation({ summary: 'Find all records using pagination' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found records' /* type: IPagination<T> */
	})
	@Get('pagination')
	async pagination(
		filter?: PaginationParams<T>,
		...options: any[]
	): Promise<IPagination<T> | void> {
		return this.crudService.paginate(filter);
	}

	@ApiOperation({ summary: 'find all' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found records' /* type: IPagination<T> */
	})
	@Get()
	async findAll(
		filter: PaginationParams<T>,
		@Query('$where', ParseJsonPipe) where?: PaginationParams<T>['where'],
		@Query('$relations', ParseJsonPipe) relations?: PaginationParams<T>['relations'],
		@Query('$order', ParseJsonPipe) order?: PaginationParams<T>['order'],
		@Query('$take') take?: PaginationParams<T>['take'],
		@Query('$skip') skip?: PaginationParams<T>['skip'],
		@Query('$select', ParseJsonPipe) select?: OptionsSelect<T>['select'],
		...options: any[]
	): Promise<IPagination<T>> {
		return this.crudService.findAll(omitBy({
			where: where ?? filter?.where,
			relations: relations ?? filter?.relations,
			order: order ?? filter?.order,
			take: take ?? filter?.take,
			skip: skip ?? filter?.skip,
			select: select,
			...(filter ?? {}),
		}, isNil));
	}
	
	@ApiOperation({ summary: 'Find by id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found one record' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get(':id')
	async findById(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('$relations', ParseJsonPipe) relations?: PaginationParams<T>['relations'],
		...options: any[]
	): Promise<T> {
		return this.crudService.findOne(id, { relations });
	}

	@ApiOperation({ summary: 'Create new record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.CREATED)
	@Post()
	async create(
		@Body() entity: DeepPartial<T>,
		...options: any[]
	): Promise<T> {
		return this.crudService.create(entity);
	}

	@ApiOperation({ summary: 'Update an existing record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully edited.'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Put(':id')
	async update(
		@Param('id', UUIDValidationPipe) id: string,
		@Body() entity: QueryDeepPartialEntity<T>,
		...options: any[]
	): Promise<any> {
		return this.crudService.update(id, entity); // FIXME: https://github.com/typeorm/typeorm/issues/1544
	}

	@ApiOperation({ summary: 'Delete record' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'The record has been successfully deleted'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Delete(':id')
	async delete(
		@Param('id', UUIDValidationPipe) id: string, 
		...options: any[]
	): Promise<any> {
		return this.crudService.delete(id);
	}
}
