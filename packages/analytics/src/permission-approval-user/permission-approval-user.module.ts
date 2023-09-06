import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionApprovalUser } from './permission-approval-user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([PermissionApprovalUser])],
	exports: [
		TypeOrmModule
	]
})
export class PermissionApprovalUserModule {}
