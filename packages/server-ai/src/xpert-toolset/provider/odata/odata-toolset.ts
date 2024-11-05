import { XpertToolsetCategoryEnum } from '@metad/contracts'
import { Service } from '@sap_oss/odata-library'
import { BaseToolset } from '../../toolset'
import { ODataTool } from './odata-tool'

export class ODataToolset extends BaseToolset<ODataTool> {
	providerType = XpertToolsetCategoryEnum.API

	static async parseMetadata(url: string) {
		const service: any = new Service({
			url,
			auth: {
				type: 'none'
			},
			strict: false
		})

		await service.init

		return Object.keys(service.entitySets).map((entitySet) => ({
			name: entitySet
		}))
	}
}
