import { WsJWTGuard } from '@metad/server-core'
import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets'
import { Observable, from } from 'rxjs'
import { map } from 'rxjs/operators'
import { Server } from 'socket.io'
import { SemanticModelService } from '../model'

@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class EventsGateway {
	@WebSocketServer()
	server: Server

	constructor(private readonly modelService: SemanticModelService) {}

	@UseGuards(WsJWTGuard)
	@SubscribeMessage('olap')
	olap(@MessageBody() data: any): Observable<WsResponse<any>> {
		console.log(data)
		const { id, modelId, body, acceptLanguage, forceRefresh } = data
		return from(
			this.modelService
				.olap(modelId, body, { acceptLanguage, forceRefresh })
				.then(({ data, cache }) => {
					return {
						event: 'olap',
						data: {
							id,
							status: 200,
							data,
							cache
						}
					}
				})
				.catch((error) => {
					return {
						event: 'olap',
						data: {
							id,
							status: 500,
							statusText: error.message ?? 'Internal Server Error',
							data: error?.response ?? error
						}
					}
				})
		)
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
