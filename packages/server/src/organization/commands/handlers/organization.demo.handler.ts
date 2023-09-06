import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { OrganizationDemoCommand } from '../organization.demo.command'

@CommandHandler(OrganizationDemoCommand)
export class OrganizationDemoHandler implements ICommandHandler<OrganizationDemoCommand> {
  public async execute(command: OrganizationDemoCommand): Promise<void> {
    return Promise.resolve()
  }
}
