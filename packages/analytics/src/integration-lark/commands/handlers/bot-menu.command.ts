import { LarkBotMenuCommand, LarkMessage } from '@metad/server-core'
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { map, Observable, of } from 'rxjs'

@CommandHandler(LarkBotMenuCommand)
export class LarkBotMenuHandler implements ICommandHandler<LarkBotMenuCommand> {
	constructor(private readonly commandBus: CommandBus) {}

	public async execute(command: LarkBotMenuCommand): Promise<Observable<LarkMessage>> {
		const { input } = command

		return of('Ok').pipe(
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
}
