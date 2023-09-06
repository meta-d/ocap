import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUser } from '@metad/contracts';
import { ConfigService } from '@metad/server-config';
import * as bcrypt from 'bcrypt';
import { UserCreateCommand } from '../user.create.command';
import { UserService } from '../../user.service';

@CommandHandler(UserCreateCommand)
export class UserCreateHandler implements ICommandHandler<UserCreateCommand> {
	protected readonly configService: ConfigService;
	protected readonly saltRounds: number;
	constructor(private readonly userService: UserService) {
		this.configService = new ConfigService();
		this.saltRounds = this.configService.get(
			'USER_PASSWORD_BCRYPT_SALT_ROUNDS'
		) as number;
	}

	public async execute(command: UserCreateCommand): Promise<IUser> {
		const { input } = command;

		return await this.userService.create({
			...input,
			hash: await this.getPasswordHash(input.hash),
			emailVerified: true,
		});
	}

	public async getPasswordHash(password: string): Promise<string> {
		return bcrypt.hash(password, this.saltRounds);
	}
}
