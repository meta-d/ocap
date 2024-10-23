import { KnowledgebaseSubscriber } from '../../knowledgebase/knowledgebase.subscriber'
import { XpertToolSubscriber } from '../../xpert-tool/xpert-tool.subscriber'
import { XpertSubscriber } from '../../xpert/xpert.subscriber'

/**
 * A map of the core TypeORM Subscribers.
 */
export const AiSubscribers = [KnowledgebaseSubscriber, XpertSubscriber, XpertToolSubscriber]
