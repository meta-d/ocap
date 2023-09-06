import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantAwareCrudService } from "./../../core/crud";
import { ImportRecord } from "./import-record.entity";


@Injectable()
export class ImportRecordService extends TenantAwareCrudService<ImportRecord> {
    
    constructor(
		@InjectRepository(ImportRecord)
		private readonly importRecordRepository: Repository<ImportRecord>,
	) {
		super(importRecordRepository);
	}
}