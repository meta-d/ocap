import { IUser } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { WsJWTGuard, WsUser } from '@metad/server-core'
import { UseGuards } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets'
import { Observable, from } from 'rxjs'
import { map } from 'rxjs/operators'
import { Server } from 'socket.io'
import { DataSourceOlapQuery } from '../data-source'
import { ModelOlapQuery } from '../model'

@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class EventsGateway {
	@WebSocketServer()
	server: Server

	constructor(private readonly queryBus: QueryBus) {}

	@UseGuards(WsJWTGuard)
	@SubscribeMessage('olap')
	async olap(@MessageBody() data: any, @WsUser() user: IUser): Promise<WsResponse<any>> {
		const { id, dataSourceId, modelId, body, acceptLanguage, forceRefresh } = data

		try {
			let result = null
			if (modelId) {
				result = await this.queryBus.execute(
					new ModelOlapQuery(
						{
							id,
							dataSourceId,
							modelId,
							body,
							acceptLanguage,
							forceRefresh
						},
						user
					)
				)
			} else {
				result = await this.queryBus.execute(
					new DataSourceOlapQuery({ id, dataSourceId, body, forceRefresh, acceptLanguage }, user)
				)
			}
			return {
				event: 'olap',
				data: {
					id,
					status: 200,
					data: result.data,
					cache: result.cache
				}
			}
		} catch (error) {
			return {
				event: 'olap',
				data: {
					id,
					status: 500,
					statusText: error.message ?? 'Internal Server Error',
					data: getErrorMessage(error)
				}
			}
		}
	}

	@UseGuards(WsJWTGuard)
	@SubscribeMessage('events')
	findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
		return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })))
	}

	@UseGuards(WsJWTGuard)
	@SubscribeMessage('identity')
	async identity(@MessageBody() data: number): Promise<number> {
		return data
	}
}
