import { ToolProviderCredentials } from '@metad/contracts'
import { Logger } from '@nestjs/common'
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs'
import { ToolProviderNotFoundError } from '../../errors'
import { TToolsetProviderSchema } from '../../types'
import { ListBuiltinCredentialsSchemaQuery } from '../list-builtin-credentials-schema.query'
import { ListBuiltinToolProvidersQuery } from '../list-builtin-providers.query'

@QueryHandler(ListBuiltinCredentialsSchemaQuery)
export class ListBuiltinCredentialsSchemaHandler implements IQueryHandler<ListBuiltinCredentialsSchemaQuery> {
	protected logger = new Logger(ListBuiltinCredentialsSchemaHandler.name)

	constructor(private readonly queryBus: QueryBus) {}

	public async execute(command: ListBuiltinCredentialsSchemaQuery): Promise<ToolProviderCredentials[]> {
		const { provider } = command

		const toolProviders = await this.queryBus.execute<ListBuiltinToolProvidersQuery, TToolsetProviderSchema[]>(
			new ListBuiltinToolProvidersQuery([provider])
		)

		if (!toolProviders[0]) {
			throw new ToolProviderNotFoundError(`Not found tool provider '${provider}'`)
		}

		return Object.entries(toolProviders[0].credentials_for_provider ?? {}).map(([name, value]) => ({...value, name}))
	}
}
