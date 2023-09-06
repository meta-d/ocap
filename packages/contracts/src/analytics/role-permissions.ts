export enum AnalyticsPermissionsEnum {
    /**
     * Edit Certification
     */
    CERTIFICATION_EDIT = 'CERTIFICATION_EDIT',
    // DataSource
    DATA_SOURCE_VIEW = 'DATA_SOURCE_VIEW',
    DATA_SOURCE_EDIT = 'DATA_SOURCE_EDIT',
    // Notification Destination
    NOTIFICATION_DESTINATION_VIEW = 'NOTIFICATION_DESTINATION_VIEW',
    NOTIFICATION_DESTINATION_EDIT = 'NOTIFICATION_DESTINATION_EDIT',
    // Subscription
    SUBSCRIPTION_VIEW = 'SUBSCRIPTION_VIEW',
    SUBSCRIPTION_EDIT = 'SUBSCRIPTION_EDIT',
    // Semantic Model
    MODELS_VIEW = 'MODELS_VIEW',
    MODELS_EDIT = 'MODELS_EDIT',
    // Story
    STORIES_VIEW = 'STORIES_VIEW',
    STORIES_EDIT = 'STORIES_EDIT',
    // BusinessGroup
    BUSINESS_AREA_VIEW = 'BUSINESS_AREA_VIEW',
    BUSINESS_AREA_EDIT = 'BUSINESS_AREA_EDIT',
    // Indicator
    INDICATOR_VIEW = 'INDICATOR_VIEW',
    INDICATOR_MARTKET_VIEW = 'INDICATOR_MARTKET_VIEW',
    INDICATOR_EDIT = 'INDICATOR_EDIT',
    // Insight
    INSIGHT_VIEW = 'INSIGHT_VIEW',
    INSIGHT_EDIT = 'INSIGHT_EDIT',

    // 权限申请审批视图, 可以浏览所有有权限的申请
    PERMISSION_APPROVAL_VIEW = 'PERMISSION_APPROVAL_VIEW',
    // 权限申请的创建权限, 不能浏览其他的申请
	PERMISSION_APPROVAL_EDIT = 'PERMISSION_APPROVAL_EDIT',
}