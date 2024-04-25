import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { IRole, IRoleFindInput, RolesEnum } from "@metad/contracts";
import { TenantBaseDTO } from "./../../core/dto";

/**
 * Find Role Query DTO validation
 */
export class FindRoleQueryDTO extends TenantBaseDTO implements IRoleFindInput {

    @ApiPropertyOptional({ type: () => String })
    @IsOptional()
    @IsString()
    readonly name: IRole['name'] = RolesEnum.EMPLOYEE;
}