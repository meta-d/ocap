import { IXpertToolset, TToolCredentials, XpertToolsetCategoryEnum } from '@metad/contracts'
import { Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { BaseToolset } from '../../toolset'
import { BuiltinTool } from './builtin-tool'
import { XpertToolsetService } from '../../xpert-toolset.service'

export type TBuiltinToolsetParams = {
	toolsetService: XpertToolsetService
	commandBus: CommandBus
}

export abstract class BuiltinToolset extends BaseToolset<BuiltinTool> {
	static provider = ''
	protected logger = new Logger(this.constructor.name)

	providerType: XpertToolsetCategoryEnum.BUILTIN

	constructor(
		public provider: string,
		protected toolset?: IXpertToolset,
		public params?: TBuiltinToolsetParams
	) {
		super(toolset)
	}

	async validateCredentials(credentials: TToolCredentials) {
		return await this._validateCredentials(credentials)
	}

	abstract _validateCredentials(credentials: TToolCredentials): Promise<void>
}
