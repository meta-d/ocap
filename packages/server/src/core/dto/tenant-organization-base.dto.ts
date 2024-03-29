import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateIf } from 'class-validator';
import { IOrganization, IBasePerTenantAndOrganizationEntityModel } from '@metad/contracts';
import { TenantBaseDTO } from './tenant-base.dto';

export class TenantOrganizationBaseDTO extends TenantBaseDTO 
	implements IBasePerTenantAndOrganizationEntityModel {
	
	@ApiProperty({ type: () => Object, readOnly: true })
	@ValidateIf((it) => !it.organizationId)
	@IsObject()
	readonly organization: IOrganization;

	@ApiProperty({ type: () => String, readOnly: true })
	@ValidateIf((it) => !it.organization)
	@IsString()
	readonly organizationId: string;
}