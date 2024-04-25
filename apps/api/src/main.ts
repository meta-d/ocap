import { Logger, LogLevel } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AnalyticsModule, AnalyticsService, prepare, seedModule } from '@metad/analytics'
import { AuthGuard, seedDefault } from '@metad/server-core'
import { json, urlencoded, text } from 'express'
import yargs from 'yargs'
import { BootstrapModule } from './app/app.module'
import { pluginConfig } from './plugin-config'

const LOGGER_LEVELS = ['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[]
const LoggerIndex = LOGGER_LEVELS.findIndex((value) => value === (process.env.LOGGER_LEVEL || 'warn'))

prepare()

async function bootstrap() {
  const app = await NestFactory.create(BootstrapModule, {
    logger: LOGGER_LEVELS.slice(0, LoggerIndex + 1)
  })

  // This will lockdown all routes and make them accessible by authenticated users only.
  const reflector = app.get(Reflector)
  app.useGlobalGuards(new AuthGuard(reflector))

  app.use(text({
    limit: '50mb',
    type: 'text/xml',
  }))
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))
	app.enableCors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
		allowedHeaders:
			'Authorization, Language, Tenant-Id, Organization-Id, X-Requested-With, X-Auth-Token, X-HTTP-Method-Override, Content-Type, Content-Language, Accept, Accept-Language, Observe'
	})

  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)

  // // Seed default values
  // const service = app.select(AnalyticsModule).get(AnalyticsService)
  // await service.seedDBIfEmpty()

  // const subscriptionService = app.select(ServerAppModule).get(SubscriptionService)
  // subscriptionService.setupJobs()

  // Setup Swagger Module
  const options = new DocumentBuilder().setTitle('Metad Cloud API').setVersion('1.0').addBearerAuth().build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('swg', app, document)

  // Listen App
  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0', () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix)
  })
}

const argv: any = yargs(process.argv).argv
const command = argv.command

if (command === 'seedModule') {
  seedModule(pluginConfig).catch((error: any) => {
    console.log(error)
    process.exit(1)
  })
} else if(command === 'seed') {
  seedDefault(pluginConfig).catch((error: any) => {
    console.log(error);
    process.exit(1);
  })  
} else {
  bootstrap()
}
