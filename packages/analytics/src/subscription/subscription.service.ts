import { Injectable, Logger } from "@nestjs/common"
import { SchedulerRegistry } from "@nestjs/schedule";
import { InjectRepository } from '@nestjs/typeorm'
import { Employee, TenantOrganizationAwareCrudService } from "@metad/server-core"
import { CronJob } from "cron";
import { Repository } from "typeorm";
import { Subscription } from "./subscription.entity";

@Injectable()
export class SubscriptionService extends TenantOrganizationAwareCrudService<Subscription> {
	
    constructor(
		@InjectRepository(Subscription)
		private readonly repo: Repository<Subscription>,
		@InjectRepository(Employee)
		protected readonly employeeRepository: Repository<Employee>
	) {
		super(repo, employeeRepository)
    }

	async setupJobs() {
		const subscriptions = await this.repository.find()

		// subscriptions.forEach(subscirption => {
		// 	const job = new CronJob(`${30} * * * * *`, () => {
		// 		this.logger.warn(`time (${30}) for job ${subscirption.id} to run!`);
		// 	  })
		// 	this.schedulerRegistry.addCronJob(subscirption.id, job)

		// 	job.start()
		// })
	}
}