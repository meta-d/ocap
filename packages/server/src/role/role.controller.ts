import { IPagination } from '@metad/contracts'
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CrudController } from './../core/crud'
import { TenantPermissionGuard } from './../shared/guards'
import { ParseJsonPipe } from './../shared/pipes'
import { Role } from './role.entity'
import { RoleService } from './role.service'

@ApiTags('Role')
@UseGuards(TenantPermissionGuard)
@Controller()
export class RoleController extends CrudController<Role> {
	constructor(private readonly roleService: RoleService) {
		super(roleService)
	}

	@ApiOperation({ summary: 'Find role.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found role',
		type: Role
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('find')
	async findRole(@Query('data', ParseJsonPipe) data: any): Promise<Role> {
		const { findInput } = data
		return this.roleService.findOne({ where: findInput })
	}

	@ApiOperation({ summary: 'Find roles.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found roles.',
		type: Role
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get()
	async findAll(): Promise<IPagination<Role>> {
		return this.roleService.findAll()
	}
}
