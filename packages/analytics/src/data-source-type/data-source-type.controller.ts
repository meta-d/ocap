import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CrudController } from '@metad/server-core';
import {
	ApiTags,
	ApiBearerAuth
} from '@nestjs/swagger';
import { DataSourceType } from './data-source-type.entity';
import { DataSourceTypeService } from './data-source-type.service';

@ApiTags('DataSourceType')
@ApiBearerAuth()
@Controller()
export class DataSourceTypeController extends CrudController<DataSourceType> {
    constructor(
		private readonly dsTypeService: DataSourceTypeService,
		private readonly commandBus: CommandBus
	) {
		super(dsTypeService);
	}
}