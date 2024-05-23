import { ICommand } from '@nestjs/cqrs'

export class CopilotExampleVectorSeedCommand implements ICommand {
	static readonly type = '[Copilot Example] Seed Vector'

	constructor(public readonly input: { tenantId: string; refresh?: boolean }) { }
}
