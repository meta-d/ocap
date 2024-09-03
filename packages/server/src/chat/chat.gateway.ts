import { ChatGatewayMessage, ChatMessage, ChatUserMessage, IUser } from '@metad/contracts'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse
} from '@nestjs/websockets'
import { from, map, Observable, switchMap } from 'rxjs'
import { Server, Socket } from 'socket.io'
import { WsJWTGuard, WsUser } from '../shared/'
import { ChatCommand } from './commands'

@WebSocketGateway({
	namespace: 'chat',
	cors: {
		origin: '*'
	}
})
export class ChatEventsGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server: Server

	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus
	) {}

	@UseGuards(WsJWTGuard)
	@SubscribeMessage('message')
	message(
		@MessageBody() data: ChatGatewayMessage,
		@ConnectedSocket() client: Socket,
		@WsUser() user: IUser
	): Observable<WsResponse<ChatMessage>> {
		return from(
			this.commandBus.execute(
				new ChatCommand({
					...data,
					tenantId: user.tenantId,
					user,
				})
			)
		).pipe(
			switchMap((res) => res),
			map((result: ChatMessage) => ({
				event: 'message',
				data: result
			}))
		)
	}

	handleDisconnect(client: Socket) {
		// console.log(`disconnect `, client.id)
	}
}
