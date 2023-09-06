import { AnalyticsFeatures, IFeatureCreateInput } from '@metad/contracts'

export const DEFAULT_FEATURES: IFeatureCreateInput[] = [
	{
		name: 'Business Area',
		code: AnalyticsFeatures.FEATURE_BUSINESS_AREA,
		description: 'Manage Business Areas',
		image: 'estimate.png',
		link: 'business-area',
		isEnabled: true,
		icon: 'file-text-outline',
		status: 'success',
	},
    {
		name: 'Indicator',
		code: AnalyticsFeatures.FEATURE_INDICATOR,
		description: 'Manage Indicators, Create First Indicator',
		image: 'estimate.png',
		link: 'indicator/market',
		isEnabled: true,
		icon: 'file-text-outline',
		status: 'success',
		children: [
			{
				name: 'Indicator Market',
				code: AnalyticsFeatures.FEATURE_INDICATOR_MARKET,
				description:
					'Manage Indicator, View and Subscribe Indicator',
				image: 'estimate-received.png',
				link: 'indicator/market',
				isEnabled: true,
				icon: 'file-text-outline',
				status: 'warning'
			},
            {
				name: 'Indicator Creation',
				code: AnalyticsFeatures.FEATURE_INDICATOR_REGISTER,
				description: 'Create Indicator',
				image: 'estimate-received.png',
				link: 'indicator/create',
				isEnabled: true,
				icon: 'file-text-outline',
				status: 'warning'
			},
            {
				name: 'My Indicator',
				code: AnalyticsFeatures.FEATURE_INDICATOR_MY,
				description: 'My Indicator',
				image: 'estimate-received.png',
				link: 'indicator/my',
				isEnabled: true,
				icon: 'file-text-outline',
				status: 'warning'
			}
		]
	},
	{
		name: 'Insight',
		code: AnalyticsFeatures.FEATURE_INSIGHT,
		description: 'Manage and View Insight Model',
		image: 'estimate.png',
		link: 'insight',
		isEnabled: true,
		icon: 'file-text-outline',
		status: 'success',
		children: [
			{
				name: 'Insight Admin',
				code: AnalyticsFeatures.FEATURE_INSIGHT_ADMIN,
				description:
					'Manage Insight',
				image: 'estimate-received.png',
				link: 'insight/admin',
				isEnabled: true,
				icon: 'file-text-outline',
				status: 'warning'
			},
            {
				name: 'Insight Model Viewer',
				code: AnalyticsFeatures.FEATURE_INSIGHT_VIEWER,
				description: 'View Insight Model',
				image: 'estimate-received.png',
				link: 'insight',
				isEnabled: true,
				icon: 'file-text-outline',
				status: 'warning'
			}
		]
	},
	{
		name: 'Story Model',
		code: AnalyticsFeatures.FEATURE_MODEL,
		description: 'Manage and View Story Model',
		image: 'estimate.png',
		link: 'model',
		isEnabled: true,
		icon: 'file-text-outline',
		status: 'success',
	},
	{
		name: 'Story',
		code: AnalyticsFeatures.FEATURE_STORY,
		description: 'Manage and View Story',
		image: 'estimate.png',
		link: 'story',
		isEnabled: true,
		icon: 'file-text-outline',
		status: 'success',
	}
]