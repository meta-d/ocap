import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from '@nestjs/typeorm'
import { Employee, TenantOrganizationAwareCrudService } from "@metad/server-core"
import { RedisClientType } from "redis";
import { Repository } from 'typeorm';
import { createNotificationDestination } from "./base-destination";
import { NotificationDestination } from "./notification-destination.entity"
import { REDIS_CLIENT } from "../core/redis.module";

@Injectable()
export class NotificationDestinationService extends TenantOrganizationAwareCrudService<NotificationDestination> {

    constructor(
		@InjectRepository(NotificationDestination)
		repository: Repository<NotificationDestination>,
		@InjectRepository(Employee)
		protected readonly employeeRepository: Repository<Employee>,
		private configService: ConfigService,
		@Inject(REDIS_CLIENT)
		private readonly redisClient: RedisClientType
	) {
		super(repository, employeeRepository)
    }

	async getGroups(id: string) {
		const destination = await this.repository.findOne(id)
		return createNotificationDestination(destination, this.redisClient).getGroups()
	}
}