import { IXpertToolset, XpertToolsetCategoryEnum } from '@metad/contracts'
import { ConfigService } from '@metad/server-config'
import { loadYamlFile } from '@metad/server-core'
import { Inject, Injectable, Logger } from '@nestjs/common'
import * as path from 'path'
import { BaseToolset } from '../../toolset'
import { TToolsetProviderSchema } from '../../types'
import { BuiltinTool } from './builtin-tool'

@Injectable()
export class BuiltinToolset extends BaseToolset<BuiltinTool> {
	protected logger = new Logger(this.constructor.name)
	public readonly MyFolderPath = 'packages/server-ai/src/xpert-toolset/provider/builtin'

	@Inject(ConfigService)
	protected readonly configService: ConfigService

	providerType: XpertToolsetCategoryEnum.BUILTIN

	providerSchema: TToolsetProviderSchema

	constructor(public provider: string, protected toolset: IXpertToolset) {
		super(toolset)

		const schema = this.getProviderSchema()

		;(this.identity = schema?.identity), (this.credentialsSchema = schema?.credentials_for_provider)
	}

	getProviderServerPath() {
		return path.join(this.configService.assetOptions.serverRoot, this.MyFolderPath, this.provider)
	}

	getProviderSchema() {
		if (this.providerSchema) {
			return this.providerSchema
		}

		const yamlPath = path.join(this.getProviderServerPath(), `${this.provider}.yaml`)

		const yamlData = loadYamlFile(yamlPath, this.logger) as Record<string, any>

		try {
			this.providerSchema = yamlData as TToolsetProviderSchema
		} catch (e) {
			throw new Error(`Invalid provider schema for ${this.provider}: ${e.message}`)
		}

		return this.providerSchema
	}
}
