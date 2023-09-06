import { ICommand } from '@nestjs/cqrs';
import { IUserRegistrationInput, LanguagesEnum } from '@metad/contracts';

export class AuthTrialCommand implements ICommand {
	static readonly type = '[Auth] Register Trial';

	constructor(
		public readonly input: IUserRegistrationInput,
		public readonly languageCode: LanguagesEnum
	) {}
}
