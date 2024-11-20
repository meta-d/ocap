import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { RouterModule } from 'nest-router'
import { AIModelController } from './ai-model.controller'
import { AIProvidersService } from './ai-model.service'
import { CommandHandlers } from './commands/handlers'
import { ProviderModules } from './model_providers'
import { QueryHandlers } from './queries/handlers'

@Module({
	imports: [RouterModule.forRoutes([{ path: '/ai-model', module: AIModelModule }]), CqrsModule, ...ProviderModules],
	controllers: [AIModelController],
	providers: [AIProvidersService, ...QueryHandlers, ...CommandHandlers],
	exports: [AIProvidersService]
})
export class AIModelModule {}
