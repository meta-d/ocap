import { Body, Controller, Logger, Post, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, TransformInterceptor } from '../core'
import { CopilotExample } from './copilot-example.entity'
import { CopilotExampleService } from './copilot-example.service'

@ApiTags('CopilotExample')
@ApiBearerAuth()
// @UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotExampleController extends CrudController<CopilotExample> {
    readonly #logger = new Logger(CopilotExampleController.name)
    constructor(private readonly service: CopilotExampleService, private readonly commandBus: CommandBus) {
        super(service)
    }

    @Post('similarity-search')
    async similaritySearch(
        @Body('query') query: string,
        @Body('options') options?: { k: number; filter: any },
    ) {
        this.#logger.debug(`[CopilotExampleController] Retrieving documents for query: ${query} with k = ${options?.k} and filter = ${options?.filter}`)

        return this.service.similaritySearch(query, options)
    }

    @Post('mmr-search')
    async maxMarginalRelevanceSearch(
        @Body('query') query: string,
        @Body('options') options?: { k: number; filter: any },
    ) {
        this.#logger.debug(`[CopilotExampleController] Retrieving documents for mmr query: ${query} with k = ${options?.k} and filter = ${options?.filter}`)

        return CalculationExamples.map((item) => ({
          pageContent: item.input + '\n' + item.ai,
          metadata: item
        }))
    }
}

export const RestrictedMeasureBikes = {
    measure: 'Sales',
    dimensions: [
      {
        dimension: '[Product]',
        hierarchy: '[Product.Category]',
        members: [
          {
            key: '[Bikes]'
          }
        ]
      }
    ],
    enableConstantSelection: true
    // slicers: [
    //   {
    //     dimension: { dimension: '[Product]' },
    //     members: [
    //       {
    //         key: '[Product].[Bikes]'
    //       }
    //     ]
    //   }
    // ]
  }
  
  export const CalculationExamples = [
    {
      input: 'Sales amount of product category bikes',
      ai: `think: call 'dimensionMemberKeySearch' tool query with param 'product category bikes' to get member key of 'product category bikes' in dimension 'product category'
  ai: create a restricted measure with params ${JSON.stringify(RestrictedMeasureBikes).replace(/\{/g, '{{').replace(/\}/g, '}}')} named 'Sales of Bikes'
  `
    },
    {
      input: `YoY of Sales amount of the product category 'bikes'`,
      ai: `think: call 'dimensionMemberKeySearch' tool query with param 'product category bikes' to get member key of 'product category bikes' in dimension 'product category'
  ai: create a formula like 'IIF(
    NOT [Date].[Year].CurrentMember.PrevMember IS NULL,
    ([Measures].[Sales] - ([Date].[Year].CurrentMember.PrevMember, [Measures].[Sales])) 
      / ([Date].[Year].CurrentMember.PrevMember, [Measures].[Sales]),
    NULL
  )' named 'Sales YoY of Bikes'`
    }
  ]