import { ApiProviderAuthType, IXpertToolset, TXpertToolEntity, XpertToolsetCategoryEnum } from '@metad/contracts'
import { Service } from '@sap_oss/odata-library'
import { uniq } from 'lodash'
import { ToolProviderCredentialValidationError } from '../../errors'
import { BaseToolset } from '../../toolset'
import { ODataTool } from './odata-tool'

export class ODataToolset extends BaseToolset<ODataTool> {
	providerType = XpertToolsetCategoryEnum.API

	protected service: any = null
	constructor(protected toolset?: IXpertToolset) {
		super()
	}

	getTools() {
		if (this.tools) {
			return this.tools
		}

		const service = this.getODataService(this.toolset)

		this.tools = this.toolset.tools
			.filter((tool) => tool.enabled)
			.map((tool) => {
				return new ODataTool(tool, service)
			})

		return this.tools
	}

	getODataService(toolset: IXpertToolset) {
		if (this.service) {
			return this.service
		}

		const credentials = toolset.credentials

		if (!credentials?.auth_type) {
			throw new ToolProviderCredentialValidationError('Missing auth_type')
		}

		let auth = null
		if (credentials?.auth_type === ApiProviderAuthType.BASIC) {
			auth = {
				type: 'basic',
				username: credentials.username,
				password: credentials.password
			}
		}

		const service: any = new Service({
			url: `${toolset.options.baseUrl}`,
			auth: auth,
			strict: false
		})

		return service
	}

	async getToolsSchema(): Promise<TXpertToolEntity[]> {
		const service = this.getODataService(this.toolset)
		await service.init

		const metadata = service.metadata

		return Object.keys(service.entitySets).map((name) => {
			const entitySet = metadata.getEntitySet(name)
			const entityType = metadata.getEntityType(entitySet.EntityType)

			const properties = uniq([...entityType.Key.map((_) => _.Name), ...Object.keys(entityType.Properties)])

			return {
				name,
				method: 'get',
				path: '/' + name,
				parameters: properties.map((name) => {
					const property = entityType.Properties[name]
					return {
						name: property.Name,
						type: property.Type,
						required: entityType.Key.some((_) => _.Name === name),
						isKey: entityType.Key.some((_) => _.Name === name),
						schema: {
							type: 'string'
						}
					}
				})
			}
		})
	}
}
