import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { IUserLoginInput } from "@metad/contracts";
import { Transform, TransformFnParams } from "class-transformer";

/**
 * Login User DTO validation
 */
export class LoginUserDTO implements IUserLoginInput {

    @ApiProperty({ type: () => String })
    @IsNotEmpty({ message: "Email should not be empty" })
    @Transform((params: TransformFnParams) => params.value.trim())
    readonly email: string;

    @ApiProperty({ type: () => String })
    @IsNotEmpty({ message: "Password should not be empty" })
    readonly password: string;
}