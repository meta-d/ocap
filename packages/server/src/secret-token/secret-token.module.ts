import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecretToken } from './secret-token.entity'
import { SecretTokenService } from './secret-token.service'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [TypeOrmModule.forFeature([SecretToken])],
	providers: [
		SecretTokenService,
		...CommandHandlers
	],
	exports: [TypeOrmModule, SecretTokenService]
})
export class SecretTokenModule {}
