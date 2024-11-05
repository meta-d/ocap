import { ConfigService } from '@metad/server-config'
import { Inject, Logger } from '@nestjs/common'
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs'
import { GetODataRemoteMetadataQuery } from '../get-odata-remote-metadata.query'
import { ODataToolset } from '../../provider'


@QueryHandler(GetODataRemoteMetadataQuery)
export class GetODataRemoteMetadataHandler implements IQueryHandler<GetODataRemoteMetadataQuery> {
	protected logger = new Logger(GetODataRemoteMetadataHandler.name)

	@Inject(ConfigService)
	protected readonly configService: ConfigService

	constructor(private readonly queryBus: QueryBus) {}

	public async execute(command: GetODataRemoteMetadataQuery): Promise<{schema: string; tools: any[]}> {
		const { url } = command

		const formattedUrl = url.endsWith('/') ? `${url}$metadata` : `${url}/$metadata`

		const response = await fetch(formattedUrl)
		const text = await response.text()

		return {
			schema: text,
			tools: await ODataToolset.parseMetadata(url)
		}
	}
}
