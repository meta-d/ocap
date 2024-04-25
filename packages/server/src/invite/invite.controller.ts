import {
	ICreateEmailInvitesOutput,
	IInviteAcceptInput,
	IInviteResendInput,
	PermissionsEnum,
	LanguagesEnum,
	IOrganizationContactAcceptInviteInput,
	IOrganizationContact,
	IPagination
} from '@metad/contracts';
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	UseGuards,
	Delete,
	Param,
	Put,
	Req,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiExcludeEndpoint
} from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { Request } from 'express';
import { I18nLang } from 'nestjs-i18n';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';
import { LanguageDecorator, Permissions, Public } from './../shared/decorators';
import { PermissionGuard, TenantPermissionGuard } from './../shared/guards';
import { ParseJsonPipe, UUIDValidationPipe, UseValidationPipe } from './../shared/pipes';
import { TransformInterceptor } from './../core/interceptors';
import {
	InviteAcceptEmployeeCommand,
	InviteAcceptOrganizationContactCommand,
	InviteAcceptUserCommand,
	InviteBulkCreateCommand,
	InviteOrganizationContactCommand,
	InviteResendCommand
} from './commands';
import { CreateInviteDTO, ValidateInviteQueryDTO } from './dto';
import { FindInviteByEmailTokenQuery } from './queries';

@ApiTags('Invite')
@UseInterceptors(TransformInterceptor)
@Controller()
export class InviteController {
	constructor(
		private readonly inviteService: InviteService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Create email invites' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Post('/emails')
	@UsePipes(new ValidationPipe({ transform: true }))
	async createManyWithEmailsId(
		@Body() entity: CreateInviteDTO,
		@LanguageDecorator() languageCode: LanguagesEnum
	): Promise<ICreateEmailInvitesOutput> {
		return await this.commandBus.execute(
			new InviteBulkCreateCommand(
				entity,
				languageCode
			)
		);
	}

	/**
	 * Validate invite by token and email
	 *
	 * @param options
	 * @returns
	 */
	@ApiOperation({ summary: 'Get invite.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found invite',
		type: Invite
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Public()
	@Get('validate')
	@UseValidationPipe({ whitelist: true })
	async validateInviteByToken(@Query() options: ValidateInviteQueryDTO) {
		return await this.queryBus.execute(
			new FindInviteByEmailTokenQuery({
				email: options.email,
				token: options.token
			})
		);
	}
	
	@ApiOperation({ summary: 'Find all invites.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found invites',
		type: Invite
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@UseGuards(TenantPermissionGuard, PermissionGuard)
	@Permissions(
		PermissionsEnum.ORG_INVITE_VIEW,
		PermissionsEnum.ORG_INVITE_EDIT
	)
	@Get()
	async findAll(
		@Query('data', ParseJsonPipe) data: any
	): Promise<IPagination<Invite>> {
		const { relations, findInput } = data;
		return this.inviteService.findAll({
			where: findInput,
			relations
		});
	}

	@ApiOperation({ summary: 'Accept employee invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('employee')
	@Public()
	async acceptEmployeeInvite(
		@Body() entity: IInviteAcceptInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<UpdateResult | Invite> {
		entity.originalUrl = request.get('Origin');
		return this.commandBus.execute(
			new InviteAcceptEmployeeCommand(entity, languageCode)
		);
	}

	@ApiOperation({ summary: 'Accept user invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('user')
	@Public()
	async acceptUserInvite(
		@Body() entity: IInviteAcceptInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<UpdateResult | Invite> {
		entity.originalUrl = request.get('Origin');
		return this.commandBus.execute(
			new InviteAcceptUserCommand(entity, languageCode)
		);
	}

	@ApiOperation({ summary: 'Accept organization contact invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Post('contact')
	@Public()
	async acceptOrganizationContactInvite(
		@Body() input: IOrganizationContactAcceptInviteInput,
		@Req() request: Request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<any> {
		input.originalUrl = request.get('Origin');
		return this.commandBus.execute(
			new InviteAcceptOrganizationContactCommand(input, languageCode)
		);
	}

	@ApiOperation({ summary: 'Resend invite.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description:
			'Invalid input, The response body may contain clues as to what went wrong'
	})
	@UseGuards(TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Post('resend')
	async resendInvite(
		@Body() entity: IInviteResendInput,
		@LanguageDecorator() languageCode: LanguagesEnum
	): Promise<UpdateResult | Invite> {
		return this.commandBus.execute(new InviteResendCommand(entity, languageCode));
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
	@UseGuards(TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Delete(':id')
	async delete(
		@Param('id', UUIDValidationPipe) id: string,
		...options: any[]
	): Promise<any> {
		return this.inviteService.delete(id);
	}

	@ApiExcludeEndpoint()
	@Put()
	async update(
		@Param('id', UUIDValidationPipe) id: string,
		...options: any[]
	): Promise<any> {
		throw new BadRequestException('Invalid route');
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
	@UseGuards(TenantPermissionGuard, PermissionGuard)
	@Permissions(PermissionsEnum.ORG_INVITE_EDIT)
	@Put('organization-contact/:id')
	async inviteOrganizationContact(
		@Param('id', UUIDValidationPipe) id: string,
		@Req() request,
		@I18nLang() languageCode: LanguagesEnum
	): Promise<IOrganizationContact> {
		return this.commandBus.execute(
			new InviteOrganizationContactCommand({
				id,
				originalUrl: request.get('Origin'),
				inviterUser: request.user,
				languageCode
			})
		);
	}
}
