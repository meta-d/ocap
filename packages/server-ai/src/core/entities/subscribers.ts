import { KnowledgebaseSubscriber } from '../../knowledgebase/knowledgebase.subscriber'
import { XpertSubscriber } from '../../xpert/xpert.subscriber'

/**
 * A map of the core TypeORM Subscribers.
 */
export const AiSubscribers = [KnowledgebaseSubscriber, XpertSubscriber]
