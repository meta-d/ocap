import { Repository } from 'typeorm'
import { BusinessArea } from '../../../entities/internal'

export async function createBusinessArea(
	repository: Repository<BusinessArea>,
	tenantId: string,
	organizationId: string,
	createdById: string,
	options: any
) {
	let area = new BusinessArea()
	area.tenantId = tenantId
	area.organizationId = organizationId
	area.createdById = createdById

	area.name = options.name
	area.parent = options.parent

	area = await repository.save(area)

	if (options.children) {
		area.children = await Promise.all(
			options.children.map((child) => {
				return createBusinessArea(repository, tenantId, organizationId, createdById, {
					...child,
					parent: area
				})
			})
		)
	}

	return area
}

export const INDICATOR = 'INDICATOR'
export const BUSINESS_AREAS = [
	{
		name: '演示',
		children: [
			{
				name: '财务',
				children: [
					{
						name: '管报',
						children: [
							{
								name: '核心指标'
							}
						]
					},
					{
						name: '经营分析',
						children: [
							{
								name: '盈利能力'
							}
						]
					}
				]
			},
			{
				name: '供应链',
				children: [
					{
						name: '仓储',
						children: [
							{
								name: '仓库指标'
							}
						]
					},
					{
						name: '销售',
						children: [
							{
								name: '门店指标'
							},
							{
								name: '产品线销售'
							}
						]
					}
				]
			}
		]
	}

]
