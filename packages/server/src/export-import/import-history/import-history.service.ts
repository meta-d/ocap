import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantAwareCrudService } from "./../../core/crud";
import { ImportHistory } from "./import-history.entity";


@Injectable()
export class ImportHistoryService extends TenantAwareCrudService<ImportHistory> {
    
    constructor(
		@InjectRepository(ImportHistory)
		private readonly importHistoryRepository: Repository<ImportHistory>,
	) {
		super(importHistoryRepository);
	}
}