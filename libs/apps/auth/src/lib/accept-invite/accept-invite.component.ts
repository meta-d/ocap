import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IInvite, IUserRegistrationInput } from '@metad/contracts';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InviteService, ToastrService } from '@metad/cloud/state';


@UntilDestroy({ checkProperties: true })
@Component({
	styleUrls: ['./accept-invite.component.scss'],
	templateUrl: 'accept-invite.component.html'
})
export class AcceptInvitePageComponent implements OnInit {

	invitation: IInvite;
	loading: boolean;
	inviteLoadErrorMessage: string;

	constructor(
		private readonly router: Router,
		private readonly route: ActivatedRoute,
        private inviteService: InviteService,
		private translate: TranslateService,
		private toastrService: ToastrService,
		private _cdr: ChangeDetectorRef
	) {
	}

	ngOnInit(): void {
		this.route
			.queryParams
			.pipe(
				tap(() => this.loading = true),
				tap(({ email, token }) => this.loadInvite(email, token)),
				untilDestroyed(this)
			)
			.subscribe();
	}

	loadInvite = async (email: string, token: string) => {
		try {
			this.invitation = await this.inviteService.validateInvite(['role', 'organization'], {
				email,
				token
			});
			if (!this.invitation) {
				throw new Error();
			}
		} catch (error) {
			this.inviteLoadErrorMessage = 'Invitation no longer valid'
		}
		this.loading = false;
		this._cdr.detectChanges()
	};

	submitForm = async (input: IUserRegistrationInput) => {
		try {
			const { user, password } = input;
			const { id: inviteId, role, organization } = this.invitation;
			// if (role.name === RolesEnum.EMPLOYEE) {
			// 	await this.inviteService.acceptEmployeeInvite({ 
			// 		user,
			// 		password,
			// 		organization,
			// 		inviteId
			// 	});
			// } else {
			await this.inviteService.acceptUserInvite({ 
				user,
				password,
				organization,
				inviteId
			});

			// }
			this.toastrService.success('Auth.ACCEPT_INVITE.PROFILE_UPDATED');
			this.router.navigate(['/auth/login']);
		} catch (error) {
			this.toastrService.danger(
				error,
				null,
				'Could not create your account'
			);
		}
	};
}
