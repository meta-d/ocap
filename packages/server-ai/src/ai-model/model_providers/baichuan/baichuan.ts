import { ConfigModule } from '@metad/server-config'
import { Injectable, Module } from '@nestjs/common'
import { ModelProvider } from '../../ai-provider'

@Injectable()
export class BaichuanProvider extends ModelProvider {
	constructor() {
		super('baichuan')
	}

	async validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
		//
	}
}

@Module({
	imports: [ConfigModule],
	providers: [BaichuanProvider],
	exports: [BaichuanProvider]
})
export class BaichuanProviderModule {}
