import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import {
  ServeStaticModule,
  ServeStaticModuleOptions,
} from '@nestjs/serve-static'
import { LanguagesEnum } from '@metad/contracts'
import { ConfigService, environment } from '@metad/server-config'
import { EmployeeModule } from './employee/employee.module'
import { RouterModule } from 'nest-router'
import { HeaderResolver, I18nJsonParser, I18nModule } from 'nestjs-i18n'
import * as path from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CoreModule } from './core/core.module'
import { CountryModule } from './country/country.module'
import { CurrencyModule } from './currency/currency.module'
import { EmailTemplateModule } from './email-template/email-template.module'
import { EmailModule } from './email/email.module'
import { FeatureModule } from './feature/feature.module'
import { resolveServeStaticPath } from './helper'
import { HomeModule } from './home/home.module'
import { OrganizationModule } from './organization/organization.module'
import { RolePermissionModule } from './role-permission/role-permission.module'
import { RoleModule } from './role/role.module'
import { TenantSettingModule } from './tenant/tenant-setting'
import { TenantModule } from './tenant/tenant.module'
import { UserOrganizationModule } from './user-organization/user-organization.module'
import { UserModule } from './user/index'
import { OrganizationDepartmentModule } from './organization-department/organization-department.module'
import { TagModule } from './tags/tag.module'
import { OrganizationContactModule } from './organization-contact/organization-contact.module'
import { OrganizationLanguageModule } from './organization-language/organization-language.module'
import { InviteModule } from './invite/invite.module'
import { OrganizationProjectModule } from './organization-project/organization-project.module'
import { CustomSmtpModule } from './custom-smtp/custom-smtp.module'
import { LanguageModule } from './language/language.module'
import { CopilotModule } from './copilot'
import { StorageFileModule } from './storage-file/storage-file.module'
import { AIModule } from './ai/ai.module'
import { CopilotExampleModule } from './copilot-example'
import { RedisModule } from './core/redis.module'
import { CqrsModule } from '@nestjs/cqrs'

@Module({
  imports: [
    ServeStaticModule.forRootAsync({
      useFactory: async (
        configService: ConfigService
      ): Promise<ServeStaticModuleOptions[]> => {
        return await resolveServeStaticPath(configService)
      },
      inject: [ConfigService],
      imports: [],
    }),
    MulterModule.register(),
    RouterModule.forRoutes([
      {
        path: '',
        children: [{ path: '/', module: HomeModule }],
      },
    ]),
    I18nModule.forRoot({
      fallbackLanguage: LanguagesEnum.English,
      parser: I18nJsonParser,
      parserOptions: {
        path: path.resolve(__dirname, 'i18n/'),
        watch: !environment.production,
      },
      resolvers: [new HeaderResolver(['language'])],
    }),
    CqrsModule,
    RedisModule,
    CoreModule,
    AuthModule,
    UserModule,
    EmployeeModule,
    TenantModule,
    TenantSettingModule,
    EmailModule,
    EmailTemplateModule,
    CountryModule,
    CurrencyModule,
    FeatureModule,
    RolePermissionModule,
    RoleModule,
    OrganizationModule,
    UserOrganizationModule,
    OrganizationDepartmentModule,
    OrganizationContactModule,
    OrganizationLanguageModule,
    OrganizationProjectModule,
    TagModule,
    InviteModule,
    CustomSmtpModule,
    LanguageModule,
    CopilotModule,
    CopilotExampleModule,
    StorageFileModule,
    AIModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class ServerAppModule {}
