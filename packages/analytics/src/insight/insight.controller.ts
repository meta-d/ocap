import { Body, Controller, Get, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
	ApiBearerAuth, ApiTags
} from '@nestjs/swagger';
import { CrudController } from '@metad/server-core';
import { InsightModel } from './insight-model.entity';
import { InsightService } from './insight.service';

@ApiTags('Insight')
@ApiBearerAuth()
@Controller()
export class InsightController extends CrudController<InsightModel> {
    constructor(
		private readonly service: InsightService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@Get('suggests')
	public async suggests(@Query('statement') statement: string) {
		return this.service.suggests(statement)
	}
}
