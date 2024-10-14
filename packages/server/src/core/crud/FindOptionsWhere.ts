import { FindConditions } from 'typeorm'

/**
 * Used for find operations.
 */
export type FindOptionsWhere<Entity> = FindConditions<Entity>
