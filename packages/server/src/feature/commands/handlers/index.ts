import { FeatureBulkCreateHandler } from './feature-bulk-create.handler';
import { FeatureToggleUpdateHandler } from './feature-toggle.update.handler';

export const CommandHandlers = [FeatureToggleUpdateHandler, FeatureBulkCreateHandler];
