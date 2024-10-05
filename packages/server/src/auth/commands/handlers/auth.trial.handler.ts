import { CurrenciesEnum, DEFAULT_TENANT, DefaultValueDateTypeEnum, IOrganizationCreateInput, IUser, RolesEnum } from '@metad/contracts'
import { ConflictException, Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs'
import { OrganizationCreateCommand } from '../../../organization/commands'
import { RoleService } from '../../../role/role.service'
import { TenantService } from '../../../tenant/index'
import { UserService } from '../../../user'
import { AuthService } from '../../auth.service'
import { AuthTrialCommand } from '../auth.trial.command'

@CommandHandler(AuthTrialCommand)
export class AuthRegisterTrialHandler implements ICommandHandler<AuthTrialCommand> {
	private readonly logger = new Logger(AuthRegisterTrialHandler.name)
	constructor(
		private readonly commandBus: CommandBus,
		private readonly publisher: EventPublisher,
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly tenantService: TenantService,
		private readonly roleService: RoleService,
	) {}

	public async execute(command: AuthTrialCommand): Promise<IUser> {
		const { input, languageCode } = command

		this.logger.debug(`Create trial user '${input.user?.email}'`)

		const tenant = await this.tenantService.findOne({
			where: { name: DEFAULT_TENANT }
		})

		this.logger.debug(`Found default tenant '${tenant?.id}'`)

		const { success, record } = await this.userService.findOneOrFail({
			where: { tenantId: tenant.id, email: input.user.email },
			relations: ['role', 'emailVerification']
		})

		if (success) {
			this.logger.debug(`Found email '${record.email}' is '${success}'`)
		}

		// 已通过邮箱验证的账号
		if (success && record.emailVerified) {

			this.logger.debug(`Found email '${record.email}' is email exists`)
			
			throw new ConflictException(input.user.email, 'email exists')
		}

		const role = await this.roleService.findOne({
			where: { name: RolesEnum.TRIAL }
		})
		if (success) {

			this.logger.debug(`Found TRIAL role and clear recreate user '${record.email}'`)
			if (record.emailVerification) {
				await this.userService.deleteEmailVarification(record.emailVerification.id)

				this.logger.debug(`deleteEmailVarification '${record.emailVerification.id}'`)
			}

			return this.authService.signup(
				{
					user: {
						...record,
						...input.user,
						tenantId: tenant.id,
						roleId: role.id
					},
					password: input.password,
				},
				languageCode
		  )
		}

		// Create organization for trial user
		const organization = await this.commandBus.execute(
			new OrganizationCreateCommand({
				name: input.user.name || input.user.thirdPartyId || input.user.email || input.user.mobile,
				tenantId: tenant.id,
				currency: CurrenciesEnum.CNY,
				defaultValueDateType: DefaultValueDateTypeEnum.TODAY
			} as IOrganizationCreateInput)
		)

		this.logger.debug(`Created organization '${organization?.id}' for trial user '${input.user.email}'`)

		const { id: userId } = await this.authService.signup(
			{
				user: {
					...input.user,
					tenantId: tenant.id,
					roleId: role.id
				},
				password: input.password,
				organizationId: organization.id
			},
			languageCode
	  	)

		this.logger.debug(`Signup user '${userId}'`)

		const user = this.publisher.mergeObjectContext(await this.userService.findOne(userId, { relations: ['role'] }))
		// Init empoyee for trial user
		// const employee = await this.commandBus.execute(
		// 	new EmployeeCreateCommand(
		// 		{
		// 			tenant,
		// 			organization,
		// 			user,
		// 			password: input.password || 'XXXX'
		// 		},
		// 		languageCode
		// 	)
		// )

		// this.logger.debug(`Created employee '${employee.id}' for trial user '${userId}'`)

		user.createTrial(organization.id)
		user.commit()

		return user
	}
}
