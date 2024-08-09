import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { TenantOrganizationBaseDTO } from '../dto';
import { OrderTypeEnum } from '@metad/contracts';


/**
 * Describes generic pagination params
 */
export abstract class PaginationParams<T> {
	/**
	 * Pagination limit
	 */
	@ApiPropertyOptional({ type: () => Number, minimum: 0, maximum: 50 })
	@IsOptional()
	@Min(0)
	@Max(50)
	@Transform((val: TransformFnParams) => parseInt(val as unknown as string, 10))
	readonly take = 10;

	/**
	 * Pagination offset
	 */
	@ApiPropertyOptional({ type: () => Number, minimum: 0 })
	@IsOptional()
	@Min(0)
	@Transform((val: TransformFnParams) => parseInt(val as unknown as string, 10))
	readonly skip = 0;

	/**
	 * OrderBy
	 */
	@ApiPropertyOptional()
	@IsOptional()
	abstract readonly order?: { [P in keyof T]?: OrderTypeEnum };

	/**
     * Simple condition that should be applied to match entities.
     */
	@ApiProperty({ type: Object, readOnly: true })
	@IsNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => TenantOrganizationBaseDTO)
	readonly where: {
		[P in keyof T]?: any // TODO
	};

	/**
     * Indicates what relations of entity should be loaded (simplified left join form).
     */
	@ApiPropertyOptional({ type: Object, readOnly: true })
	@IsOptional()
	readonly relations?: any
}

// export abstract class OptionParams<T> {
// 	/**
// 	 * Order, in which entities should be ordered.
// 	 */
// 	@ApiPropertyOptional({ type: Object, readOnly: true })
// 	@IsOptional()
// 	readonly order: FindOptionsOrder<T>;

// 	/**
//      * Simple condition that should be applied to match entities.
//      */
// 	@ApiProperty({ type: Object, readOnly: true })
// 	@IsNotEmpty()
// 	@ValidateNested({ each: true })
// 	@Type(() => TenantOrganizationBaseDTO)
// 	readonly where: {
// 		[P in keyof T]?: FindOptionsWhereProperty<NonNullable<T[P]>>;
// 	};

// 	/**
//      * Indicates what relations of entity should be loaded (simplified left join form).
//      */
// 	@ApiPropertyOptional({ type: Object, readOnly: true })
// 	@IsOptional()
// 	readonly relations?: FindOptionsRelations<T>;
// }

// /**
//  * Describes generic pagination params
//  */
// export abstract class PaginationParams<T = any> extends OptionParams<T>{
// 	/**
//      * Limit (paginated) - max number of entities should be taken.
//      */
// 	@ApiPropertyOptional({ type: () => Number, minimum: 0, maximum: 100 })
// 	@IsOptional()
// 	@Min(0)
// 	@Max(100)
// 	@Transform((params: TransformFnParams) => parseInt(params.value, 10))
// 	readonly take: number = 10;

// 	/**
//      * Offset (paginated) where from entities should be taken.
//      */
// 	@ApiPropertyOptional({ type: () => Number, minimum: 0 })
// 	@IsOptional()
// 	@Min(0)
// 	@Transform((params: TransformFnParams) => parseInt(params.value, 10))
// 	readonly skip: number = 0;
// }
