import { Service } from '@sap_oss/odata-library'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

describe('OData Tool Tests', () => {
	let service
	const url = process.env.ODATA_TOOL_SAP_SYSTEM + `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV`

	beforeEach(() => {
		service = new Service({
			url,
			auth: {
				type: 'basic',
				username: process.env.ODATA_TOOL_SAP_USERNAME,
				password: process.env.ODATA_TOOL_SAP_PASSWORD
			},
			strict: false
		})
	})

	it('should initialize service with correct URL', async () => {
		await service.init
		expect(service.agent.settings.url).toBe(url)
	})

	it('should have metadata initialized', async () => {
		await service.init
		expect(service.metadata).toBeDefined()
	})

	it('should have entitySets available after initialization', async () => {
		await service.init
		expect(service.entitySets).toBeDefined()
	})

	it('should have functionImports available after initialization', async () => {
		await service.init
		expect(service.functionImports).toBeDefined()
	})

	it('should have actionImports available after initialization', async () => {
		await service.init
		expect(service.actionImports).toBeDefined()
	})

	it('should query A_PurchaseOrderType successfully', async () => {
		await service.init
		const entitySet = service.entitySets['A_PurchaseOrder']

		expect(entitySet).toBeDefined()

		const queryResult = await entitySet.filter(`PurchasingProcessingStatus eq '05'`).get(101)
		expect(queryResult).toBeDefined()
		// console.log(queryResult.length)
		expect(queryResult.length).toBeGreaterThan(0)
	})
})

describe('OData Tool Tests for TripPinRESTier', () => {
	let tripPinService
	const url = 'https://services.odata.org/TripPinRESTierService/(S(gpti0o5qv3p14bmkguhklnz0))'

	beforeEach(() => {
		tripPinService = new Service({
			url,
			auth: {
				type: 'none'
			},
			strict: false
		})
	})

	it('should initialize service with correct URL', async () => {
		await tripPinService.init
		expect(tripPinService.agent.settings.url).toBe(url)
	})

	it('should query People entity set from TripPinRESTierService', async () => {
		await tripPinService.init
		const peopleEntitySet = tripPinService.entitySets['People']

		expect(peopleEntitySet).toBeDefined()

		const queryResult = await peopleEntitySet.get(10)
		expect(queryResult).toBeDefined()
		expect(queryResult.length).toBeGreaterThan(0)
	})

	it('should list all entity sets', async () => {
		await tripPinService.init
		const entitySets = tripPinService.entitySets
		const metadata = tripPinService.metadata
		

		// console.log(Object.keys(entitySets).map((name) => JSON.stringify(entitySets[name].metadata.raw, null, 2)))
		console.log(Object.keys(entitySets).map((name) => {
			const entitySet = metadata.getEntitySet(name)
			const entityType = metadata.getEntityType(entitySet.EntityType)
			return entityType.Key
		}))

		expect(entitySets).toBeDefined()
		expect(Object.keys(entitySets).length).toBeGreaterThan(0)

		// Optionally, log the entity set names for verification
		// console.log(Object.keys(entitySets))
	})
})
