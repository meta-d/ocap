import { LarkBotMenuCommand, LarkMessage } from '@metad/server-core'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { map, Observable, of } from 'rxjs'
import { UserSessionCommand } from '../../../chatbi'

@CommandHandler(LarkBotMenuCommand)
export class LarkBotMenuHandler implements ICommandHandler<LarkBotMenuCommand> {
	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: LarkBotMenuCommand): Promise<Observable<LarkMessage>> {
		const { input } = command

		const { event_key, operator } = input.message

		if (event_key.startsWith('select_cube:')) {
			// 'select_cube:46ccbc05-68c0-4434-9e03-2fec8a57a631:f38998f9-4c1f-40b3-80c5-2f4cfd48ecbb:Sales'
			const parts = event_key.split(':')
			const organizaitonId = parts[1]
			const modelId = parts[2]
			const cubeName = parts[3]
			await this.commandBus.execute(
				new UserSessionCommand({
					tenantId: input.tenant.id,
					organizationId: organizaitonId,
					modelId,
					cubeName,
					userId: operator.operator_id.open_id
				})
			)

			return of(`You have select cube: ${cubeName}`).pipe(
				map(
					(content: string) =>
						({
							params: {
								receive_id_type: 'open_id'
							},
							data: {
								receive_id: input.message.operator.operator_id.open_id,
								content: JSON.stringify({ text: content }),
								msg_type: 'text'
							}
						}) as LarkMessage
				)
			)
		}

		return of(null)
	}
}
