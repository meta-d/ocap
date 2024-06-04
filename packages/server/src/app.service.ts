import { ConfigService } from '@metad/server-config'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
// import { SeedDataService } from './core/seeds/seed-data.service';
import { CommandBus } from '@nestjs/cqrs'
import * as chalk from 'chalk'
import { CopilotExampleService } from './copilot-example/copilot-example.service'
import { UserService } from './user/user.service'

@Injectable()
export class AppService {
	public count = 0

	/**
	 * Seed DB if no users exists (for simplicity and safety we only re-seed DB if no users found)
	 * TODO: this should actually include more checks, e.g. if schema migrated and many other things
	 */
	async seedDBIfEmpty() {
		this.count = await this.userService.count()
		console.log(chalk.magenta(`Found ${this.count} users in DB`))
		if (this.count === 0) {
			// await this.seedDataService.runDefaultSeed(true);
		}

		setTimeout(async () => {
			await this.exampleService.seedRedisIfEmpty()
		}, 3000)
	}

	constructor(
		private readonly commandBus: CommandBus,

		// @Inject(forwardRef(() => SeedDataService))
		// private readonly seedDataService: SeedDataService,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,

		@Inject(forwardRef(() => ConfigService))
		private readonly configService: ConfigService,

		@Inject(forwardRef(() => CopilotExampleService))
		private readonly exampleService: CopilotExampleService
	) {}

	/*
	 * Seed DB for Demo server
	 */
	async excuteDemoSeed() {
		if (this.count === 0 && this.configService.get('demo') === true) {
			// this.seedDataService.excuteDemoSeed();
		}
	}
}
