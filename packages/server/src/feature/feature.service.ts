import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Feature } from './feature.entity';
import { CrudService } from '../core/crud/crud.service';
import {
	IFeature,
	IFeatureCreateInput,
	IPagination
} from '@metad/contracts';
import * as chalk from 'chalk';
import { TenantService } from '../tenant/tenant.service';
import { DEFAULT_FEATURES } from './default-features';
import { DEFAULT_TENANT } from '../tenant/default-tenants';
import { createFeature } from './feature.seed';

@Injectable()
export class FeatureService extends CrudService<Feature> {
	constructor(
		@InjectRepository(Feature)
		public readonly featureRepository: Repository<Feature>,
		private readonly tenantService: TenantService
	) {
		super(featureRepository);
	}

	async getParentFeatures(request: any): Promise<IPagination<IFeature>> {
		const { relations = [] } = request;
		return await this.findAll({
			where: {
				parentId: IsNull()
			},
			relations,
			order: {
				createdAt: 'ASC'
			}
		});
	}

	// async seedDBIfEmpty() {
	// 	const count = await this.featureRepository.count()

	// 	console.log(chalk.magenta(`Found ${count} Features in DB`));
	// 	if (count === 0) {
	// 		await this.seed()
	// 	}
	// }

	// async seed() {
	// 	// Get default Tenant
	// 	const tenant = await this.tenantService.findOne({where: {name: DEFAULT_TENANT}})
	// 	const config = {assetOptions: {}, apiConfigOptions: {}, dbConnectionOptions: {}} as any

	// 	// Seed default data
	// 	DEFAULT_FEATURES.forEach(async (item: IFeatureCreateInput) => {
	// 		const feature: IFeature = createFeature(item, tenant, config);
	// 		const parent = await this.repository.save(feature);
	
	// 		const { children = [] } = item;
	// 		if (children.length > 0) {
	// 			const featureChildren: IFeature[] = [];
	// 			children.forEach((child: IFeature) => {
	// 				const childFeature: IFeature = createFeature(
	// 					child,
	// 					tenant,
	// 					config
	// 				);
	// 				childFeature.parent = parent;
	// 				featureChildren.push(childFeature);
	// 			});
	
	// 			await this.repository.save(featureChildren);
	// 		}
	// 	});
	// 	return await this.repository.find();
	// }
}
