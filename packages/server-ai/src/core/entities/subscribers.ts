import { KnowledgebaseSubscriber } from '../../knowledgebase/knowledgebase.subscriber'
import { XpertRoleSubscriber } from '../../xpert-role/xpert-role.subscriber'

/**
 * A map of the core TypeORM Subscribers.
 */
export const AiSubscribers = [KnowledgebaseSubscriber, XpertRoleSubscriber]
