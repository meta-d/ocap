import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ComponentLayoutStyleEnum } from "@metad/contracts";

export class UpdatePreferredComponentLayoutDTO {

	@ApiProperty({ type: () => String, enum: ComponentLayoutStyleEnum })
	@IsNotEmpty()
    @IsEnum(ComponentLayoutStyleEnum)
    readonly preferredComponentLayout: ComponentLayoutStyleEnum;
}