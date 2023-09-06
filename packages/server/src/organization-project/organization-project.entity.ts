import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	ManyToMany,
	OneToMany,
	RelationId,
	JoinTable
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsDate,
	IsEnum,
	IsBoolean,
	IsNumber
} from 'class-validator';
import {
	IOrganizationProject,
	CurrenciesEnum,
	TaskListTypeEnum,
	IOrganizationContact,
	ITag,
	IEmployee,
	OrganizationProjectBudgetTypeEnum,
} from '@metad/contracts';
import {
	Employee,
	OrganizationContact,
	Tag,
	TenantOrganizationBaseEntity,
} from '../core/entities/internal';

@Entity('organization_project')
export class OrganizationProject
	extends TenantOrganizationBaseEntity
	implements IOrganizationProject {
	
	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	name: string;

	@ApiPropertyOptional({ type: () => Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	startDate?: Date;

	@ApiPropertyOptional({ type: () => Date })
	@IsDate()
	@IsOptional()
	@Column({ nullable: true })
	endDate?: Date;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@Column({ nullable: true })
	billing: string;

	@ApiProperty({ type: () => String, enum: CurrenciesEnum })
	@IsEnum(CurrenciesEnum)
	@IsNotEmpty()
	@Index()
	@Column({ nullable: true })
	currency: string;

	@ApiProperty({ type: () => Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	public: boolean;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@Column({ nullable: true })
	owner: string;

	@ApiProperty({ type: () => String, enum: TaskListTypeEnum })
	@IsEnum(TaskListTypeEnum)
	@Column({ default: TaskListTypeEnum.GRID })
	taskListType: string;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	code?: string;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	description?: string;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	color?: string;

	@ApiPropertyOptional({ type: () => Boolean })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	billable?: boolean;

	@ApiPropertyOptional({ type: () => Boolean })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	billingFlat?: boolean;

	@ApiPropertyOptional({ type: () => Boolean })
	@IsOptional()
	@Column({ nullable: true })
	openSource?: boolean;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	projectUrl?: string;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	openSourceProjectUrl?: string;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	budget?: number;

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({
		type: 'text',
		nullable: true,
		default: OrganizationProjectBudgetTypeEnum.COST
	})
	budgetType?: OrganizationProjectBudgetTypeEnum;

	@ApiProperty({ type: () => Number })
	@IsNumber()
	@Column({ nullable: true, default: 0 })
	membersCount?: number;

	@ApiPropertyOptional({ type: () => String, maxLength: 500 })
	@Column({ length: 500, nullable: true })
	imageUrl?: string;

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne 
    |--------------------------------------------------------------------------
    */

	// @ApiPropertyOptional({ type: () => OrganizationContact })
	// @ManyToOne(() => OrganizationContact, (it) => it.projects, { 
	// 	nullable: true,
	// 	onUpdate: 'CASCADE',
	// 	onDelete: 'SET NULL' 
	// })
	// @JoinColumn()
	// organizationContact?: IOrganizationContact;

	// @ApiProperty({ type: () => String })
	// @RelationId((it: OrganizationProject) => it.organizationContact)
	// @IsString()
	// @Index()
	// @Column({ nullable: true })
	// organizationContactId?: string;

	/*
    |--------------------------------------------------------------------------
    | @OneToMany 
    |--------------------------------------------------------------------------
    */
	
	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
	// Organization Project Tags
	@ApiProperty({ type: () => Tag })
	@ManyToMany(() => Tag, (tag) => tag.organizationProjects, {
        onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
    })
	@JoinTable({
		name: 'tag_organization_project'
	})
	tags: ITag[];
	
	// Organization Project Employees
	@ManyToMany(() => Employee, (employee) => employee.projects, {
        onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
    })
	members?: IEmployee[];
}
