import { IInvite, InviteStatusEnum } from '@metad/contracts';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateResult } from 'typeorm';
import { AuthService } from '../../../auth/auth.service';
import { getUserDummyImage } from '../../../core';
import { Employee } from '../../../employee/employee.entity';
import { OrganizationService } from '../../../organization/organization.service';
import { OrganizationContactService } from '../../../organization-contact/organization-contact.service';
import { OrganizationDepartmentService } from '../../../organization-department/organization-department.service';
import { OrganizationProjectService } from '../../../organization-project/organization-project.service';
import { InviteService } from '../../invite.service';
import { InviteAcceptEmployeeCommand } from '../invite.accept-employee.command';

/**
 * Use this command for registering employees.
 * This command first registers a user, then creates an employee entry for the organization.
 * If the above two steps are successful, it finally sets the invitation status to accepted
 */
@CommandHandler(InviteAcceptEmployeeCommand)
export class InviteAcceptEmployeeHandler
	implements ICommandHandler<InviteAcceptEmployeeCommand> {
	constructor(
		private readonly inviteService: InviteService,
		// private readonly employeeService: EmployeeService,
		private readonly organizationService: OrganizationService,
		private readonly organizationProjectService: OrganizationProjectService,
		private readonly organizationContactService: OrganizationContactService,
		private readonly organizationDepartmentsService: OrganizationDepartmentService,
		private readonly authService: AuthService
	) {}

	public async execute(
		command: InviteAcceptEmployeeCommand
	): Promise<UpdateResult | IInvite> {
		const { input, languageCode } = command;

		const invite = await this.inviteService.findOneByOptions({
			where: { id: input.inviteId },
			relations: [
				'projects',
				'organizationContact',
				'departments',
				'projects.members',
				'organizationContact.members',
				'departments.members'
			]
		});

		if (!invite) {
			throw Error('Invite does not exist');
		}
		const organization = await this.organizationService.findOneByIdString(
			input.organization.id
		);
		if (!organization.invitesAllowed) {
			throw Error('Organization no longer allows invites');
		}

		if (!input.user.imageUrl) {
			input.user.imageUrl = getUserDummyImage(input.user);
		}

		const user = await this.authService.register(
			{
				...input,
				user: {
					...input.user,
					tenant: {
						id: organization.tenantId
					}
				},
				organizationId: input.organization.id
			},
			languageCode
		);

		// const employee = await this.employeeService.create({
		// 	user,
		// 	organization: input.organization,
		// 	tenant: {
		// 		id: organization.tenantId
		// 	},
		// 	startedWorkOn: invite.actionDate || null
		// });

		// this.updateEmployeeMemberships(invite, employee);

		// this.inviteService.sendAcceptInvitationEmail(organization, employee, languageCode);

		return await this.inviteService.update(input.inviteId, {
			status: InviteStatusEnum.ACCEPTED
		});
	}

	updateEmployeeMemberships = (invite: IInvite, employee: Employee) => {
		// //Update project members
		// if (invite.projects) {
		// 	invite.projects.forEach((project) => {
		// 		let members = project.members || [];
		// 		members = [...members, employee];
		// 		//This will call save() on the project (and not really create a new organization project)
		// 		this.organizationProjectService.create({
		// 			...project,
		// 			members
		// 		});
		// 	});
		// }
			
		// //Update organization Contacts members
		// if (invite.organizationContacts) {
		// 	invite.organizationContacts.forEach((organizationContact) => {
		// 		let members = organizationContact.members || [];
		// 		members = [...members, employee];
		// 		//This will call save() on the organizationContacts (and not really create a new organization Contacts)
		// 		this.organizationContactService.create({
		// 			...organizationContact,
		// 			members
		// 		});
		// 	});
		// }

		//Update department members
		if (invite.departments) {
			invite.departments.forEach((department) => {
				let members = department.members || [];
				members = [...members, employee];
				//This will call save() on the department (and not really create a new organization department)
				this.organizationDepartmentsService.create({
					...department,
					members
				});
			});
		}
	};
}
