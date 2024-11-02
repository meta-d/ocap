import { IXpertToolset, TToolCredentials, XpertToolsetCategoryEnum } from '@metad/contracts'
import { ConfigService } from '@metad/server-config'
import { loadYamlFile } from '@metad/server-core'
import { Inject, Logger } from '@nestjs/common'
import * as path from 'path'
import { BaseToolset } from '../../toolset'
import { TToolsetProviderSchema } from '../../types'
import { BuiltinTool } from './builtin-tool'

export abstract class BuiltinToolset extends BaseToolset<BuiltinTool> {
	static provider = ''
	protected logger = new Logger(this.constructor.name)

	// @Inject(ConfigService)
	// protected readonly configService: ConfigService

	providerType: XpertToolsetCategoryEnum.BUILTIN

	// providerSchema: TToolsetProviderSchema

	constructor(public provider: string, protected toolset?: IXpertToolset) {
		super(toolset)

		// const schema = this.getProviderSchema()

		// ;(this.identity = schema?.identity), (this.credentialsSchema = schema?.credentials_for_provider)
	}

	// getProviderServerPath() {
	// 	return path.join(this.configService.assetOptions.serverRoot, this.MyFolderPath, this.provider)
	// }

	// getProviderSchema() {
	// 	if (this.providerSchema) {
	// 		return this.providerSchema
	// 	}

	// 	const yamlPath = path.join(this.getProviderServerPath(), `${this.provider}.yaml`)

	// 	const yamlData = loadYamlFile(yamlPath, this.logger) as Record<string, any>

	// 	try {
	// 		this.providerSchema = yamlData as TToolsetProviderSchema
	// 	} catch (e) {
	// 		throw new Error(`Invalid provider schema for ${this.provider}: ${e.message}`)
	// 	}

	// 	return this.providerSchema
	// }

	async validateCredentials(credentials: TToolCredentials) {
		return await this._validateCredentials(credentials)
	}

	abstract _validateCredentials(credentials: TToolCredentials): Promise<void>
}
