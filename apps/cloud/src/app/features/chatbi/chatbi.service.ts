import { computed, inject, Injectable, signal } from '@angular/core'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { nanoid } from '@metad/copilot'
import { markdownModelCube } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { EntityType, isEntityType } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { derivedAsync } from 'ngxtension/derived-async'
import { filter, firstValueFrom, Observable, switchMap } from 'rxjs'
import { registerModel } from '../../@core'
import { ChatbiConverstion } from './types'

@Injectable()
export class ChatbiService {
  readonly #modelsService = inject(ModelsService)
  readonly #dsCoreService = inject(NgmDSCoreService)
  readonly #wasmAgent = inject(WasmAgentService)

  readonly models$ = this.#modelsService.getMy()

  readonly #model = signal<NgmSemanticModel>(null)
  readonly error = signal<string>(null)
  readonly cube = signal<string>(null)

  readonly _suggestedPrompts = signal<Record<string, string[]>>({})
  readonly dataSourceName = computed(() => getSemanticModelKey(this.#model()))

  readonly cubes = derivedAsync(() => {
    const dataSourceName = this.dataSourceName()
    if (dataSourceName) {
      return this.#dsCoreService
        .getDataSource(dataSourceName)
        .pipe(switchMap((dataSource) => dataSource.discoverMDCubes()))
    }
    return null
  })

  readonly conversations = signal<ChatbiConverstion[]>([])
  readonly conversation = signal<ChatbiConverstion>(null)

  readonly entityType = derivedAsync<EntityType>(() => {
    const dataSourceName = this.dataSourceName()
    const cube = this.cube()
    if (dataSourceName && cube) {
      return this.#dsCoreService.getDataSource(dataSourceName).pipe(
        switchMap((dataSource) => dataSource.selectEntityType(cube)),
        filter((entityType) => isEntityType(entityType))
      ) as Observable<EntityType>
    }

    return null
  })

  readonly context = computed(() =>
    this.entityType()
      ? markdownModelCube({ modelId: '', dataSource: this.dataSourceName(), cube: this.entityType() })
      : ''
  )

  constructor() {
    this.newConversation()
    this.conversation.update((state) => ({
      ...state,
      messages: [
        {
          id: '4-C5FuPJs_s1Bpj-JQtvU',
          role: 'user',
          content: '分析退货金额',
          createdAt: new Date()
        },
        {
          id: 'xx0Jd4FJMSFDJoIZxBUb3',
          role: 'assistant',
          content: '',
          createdAt: new Date(),
          data: [
            '以下是客户退货金额的分析结果：',
            {
              dataSettings: {
                dataSource: '8n3Rd11EC7',
                entitySet: '2CISDCUSTRETITMC2/2CCSDCUSTRETITMQ2',
                chartAnnotation: {
                  chartType: {
                    type: 'Bar',
                    orient: 'vertical',
                    variant: 'none'
                  },
                  dimensions: [
                    {
                      dimension: '[2CISDCUSTRETURN]',
                      zeroSuppression: true,
                      chartOptions: {
                        dataZoom: {
                          type: 'inside'
                        }
                      }
                    }
                  ],
                  measures: [
                    {
                      dimension: 'Measures',
                      measure: 'IncomingCustReturnsNetAmtInDC',
                      chartOptions: {},
                      formatting: {
                        shortNumber: true
                      },
                      palette: {
                        name: 'Viridis'
                      }
                    }
                  ]
                },
                presentationVariant: {
                  groupBy: [
                    {
                      dimension: '[2CFQTLMCEYT9W1MIVG4J3MWLDJC]',
                      hierarchy: '[2CFQTLMCEYT9W1MIVG4J3MWLDJC]',
                      level: null
                    },
                    {
                      dimension: '[2CGOU3ZGJKCXSN8U34S2EXVC53Z]',
                      hierarchy: '[2CGOU3ZGJKCXSN8U34S2EXVC53Z]',
                      level: null
                    },
                    {
                      dimension: '[2CH8E7SSZB3HGI2PZMS15HWHX64]',
                      hierarchy: '[2CH8E7SSZB3HGI2PZMS15HWHX64]',
                      level: null
                    },
                    {
                      dimension: '[2CHCRGUP0R4NMH0L2V41D27GEWS]',
                      hierarchy: '[2CHCRGUP0R4NMH0L2V41D27GEWS]',
                      level: null
                    },
                    {
                      dimension: '[2CI7F9QR003L37R26ZYSVM4DTIU]',
                      hierarchy: '[2CI7F9QR003L37R26ZYSVM4DTIU]',
                      level: null
                    },
                    {
                      dimension: '[2CIFIBUSAREA]',
                      hierarchy: '[2CIFIBUSAREA]',
                      level: null
                    },
                    {
                      dimension: '[2CIFICOMPANYCODE]',
                      hierarchy: '[2CIFICOMPANYCODE]',
                      level: null
                    },
                    {
                      dimension: '[2CINAA9QMSAZLAA94UCN8DXI1DN]',
                      hierarchy: '[2CINAA9QMSAZLAA94UCN8DXI1DN]',
                      level: null
                    },
                    {
                      dimension: '[2CINXNDXQ1QJSOW2N3YHP81PXW0]',
                      hierarchy: '[2CINXNDXQ1QJSOW2N3YHP81PXW0]',
                      level: null
                    },
                    {
                      dimension: '[2CIPLANT]',
                      hierarchy: '[2CIPLANT]',
                      level: null
                    },
                    {
                      dimension: '[2CIPRODUCT]',
                      hierarchy: '[2CIPRODUCT]',
                      level: null
                    },
                    {
                      dimension: '[2CIRMRETREASON]',
                      hierarchy: '[2CIRMRETREASON]',
                      level: null
                    },
                    {
                      dimension: '[2CISDBILLGBLKRSN]',
                      hierarchy: '[2CISDBILLGBLKRSN]',
                      level: null
                    },
                    {
                      dimension: '[2CISDBILLGBLKSTS]',
                      hierarchy: '[2CISDBILLGBLKSTS]',
                      level: null
                    },
                    {
                      dimension: '[2CISDBILLRELVCODE]',
                      hierarchy: '[2CISDBILLRELVCODE]',
                      level: null
                    },
                    {
                      dimension: '[2CISDCUSTGRP]',
                      hierarchy: '[2CISDCUSTGRP]',
                      level: null
                    },
                    {
                      dimension: '[2CISDCUSTPAYTTRMS]',
                      hierarchy: '[2CISDCUSTPAYTTRMS]',
                      level: null
                    },
                    {
                      dimension: '[2CISDCUSTRETITMC2-DIVISION]',
                      hierarchy: '[2CISDCUSTRETITMC2-DIVISION]',
                      level: null
                    },
                    {
                      dimension: '[2CISDCUSTRETTYPE]',
                      hierarchy: '[2CISDCUSTRETTYPE]',
                      level: null
                    },
                    {
                      dimension: '[2CISDCUSTRETURN]',
                      hierarchy: '[2CISDCUSTRETURN]',
                      level: null
                    },
                    {
                      dimension: '[2CISDDISTRCHANNEL]',
                      hierarchy: '[2CISDDISTRCHANNEL]',
                      level: null
                    },
                    {
                      dimension: '[2CISDDIVISION]',
                      hierarchy: '[2CISDDIVISION]',
                      level: null
                    },
                    {
                      dimension: '[2CISDDOCCAT]',
                      hierarchy: '[2CISDDOCCAT]',
                      level: null
                    },
                    {
                      dimension: '[2CISDORDRELBILSTS]',
                      hierarchy: '[2CISDORDRELBILSTS]',
                      level: null
                    },
                    {
                      dimension: '[2CISDPROCESSSTS]',
                      hierarchy: '[2CISDPROCESSSTS]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSALESDOC]',
                      hierarchy: '[2CISDSALESDOC]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSALESDOCITEM]',
                      hierarchy: '[2CISDSALESDOCITEM]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSALESGROUP]',
                      hierarchy: '[2CISDSALESGROUP]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSALESOFFICE]',
                      hierarchy: '[2CISDSALESOFFICE]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSALESORG]',
                      hierarchy: '[2CISDSALESORG]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSDDOCREASON]',
                      hierarchy: '[2CISDSDDOCREASON]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSHIPPINGPNT]',
                      hierarchy: '[2CISDSHIPPINGPNT]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSLSDOCITMCAT]',
                      hierarchy: '[2CISDSLSDOCITMCAT]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSLSDOCRJNRSN]',
                      hierarchy: '[2CISDSLSDOCRJNRSN]',
                      level: null
                    },
                    {
                      dimension: '[2CISDSTATVALCTR]',
                      hierarchy: '[2CISDSTATVALCTR]',
                      level: null
                    },
                    {
                      dimension: '[2CI_CUSTOMER_CDS]',
                      hierarchy: '[2CI_CUSTOMER_CDS]',
                      level: null
                    },
                    {
                      dimension: '[2CJDJBVNQTD77H23720T58P01JB]',
                      hierarchy: '[2CJDJBVNQTD77H23720T58P01JB]',
                      level: null
                    },
                    {
                      dimension: '[2CJH3OSLCXYDF3K0HQ9K8LHJUEE]',
                      hierarchy: '[2CJH3OSLCXYDF3K0HQ9K8LHJUEE]',
                      level: null
                    },
                    {
                      dimension: '[2CKJYF8HUWTUHV9BAF9ZMFB1AY9]',
                      hierarchy: '[2CKJYF8HUWTUHV9BAF9ZMFB1AY9]',
                      level: null
                    },
                    {
                      dimension: '[2CLN09DR4XKYP4B8S67E2473CA9]',
                      hierarchy: '[2CLN09DR4XKYP4B8S67E2473CA9]',
                      level: null
                    },
                    {
                      dimension: '[2CLP70QO19P5Y3MZ3SI1JG4C3KU]',
                      hierarchy: '[2CLP70QO19P5Y3MZ3SI1JG4C3KU]',
                      level: null
                    },
                    {
                      dimension: '[2CM40HTK3P2QC4KCP77W1FHIAQO]',
                      hierarchy: '[2CM40HTK3P2QC4KCP77W1FHIAQO]',
                      level: null
                    },
                    {
                      dimension: '[2CPXAV4IK0C7K3MZF219JFN92JX]',
                      hierarchy: '[2CPXAV4IK0C7K3MZF219JFN92JX]',
                      level: null
                    },
                    {
                      dimension: '[2CRHJL2KOLPCBG8UEP4H9XEGLQG]',
                      hierarchy: '[2CRHJL2KOLPCBG8UEP4H9XEGLQG]',
                      level: null
                    },
                    {
                      dimension: '[2CRTHLQN6FSGIUN5YM5SL1AQ0VC]',
                      hierarchy: '[2CRTHLQN6FSGIUN5YM5SL1AQ0VC]',
                      level: null
                    },
                    {
                      dimension: '[2CSO36ORCWY9FJ2XUIRUWX9ROFO]',
                      hierarchy: '[2CSO36ORCWY9FJ2XUIRUWX9ROFO]',
                      level: null
                    },
                    {
                      dimension: '[2CSXGU170OIGL1EXPUIZM0ZJCP1]',
                      hierarchy: '[2CSXGU170OIGL1EXPUIZM0ZJCP1]',
                      level: null
                    },
                    {
                      dimension: '[2CU9B2GK0QZ901UNEPWGWTMSL0C]',
                      hierarchy: '[2CU9B2GK0QZ901UNEPWGWTMSL0C]',
                      level: null
                    },
                    {
                      dimension: '[2CHZ276S811VHLNTDXRYPKEWXXJ]',
                      hierarchy: '[2CHZ276S811VHLNTDXRYPKEWXXJ]',
                      level: null
                    },
                    {
                      dimension: '[2CISDCUSTRETITMC2-BASEUNIT]',
                      hierarchy: '[2CISDCUSTRETITMC2-BASEUNIT]',
                      level: null
                    },
                    {
                      dimension: '[2CKVPJ23VKC5RRGOHN2WIXBC66M]',
                      hierarchy: '[2CKVPJ23VKC5RRGOHN2WIXBC66M]',
                      level: null
                    }
                  ]
                }
              }
            },
            '图表展示了客户退货的金额分布情况。'
          ]
        }
      ]
    }))
  }

  setCube(cube: string) {
    this.error.set(null)
    this.cube.set(cube)
  }

  async setModel(model: NgmSemanticModel) {
    this.setCube(null)
    model = convertNewSemanticModelResult(
      await firstValueFrom(
        this.#modelsService.getById(model.id, ['indicators', 'createdBy', 'updatedBy', 'dataSource', 'dataSource.type'])
      )
    )
    this.#model.set(model)

    if (!this._suggestedPrompts()[this.dataSourceName()]) {
      this.registerModel(model)
    }
  }

  private registerModel(model: NgmSemanticModel) {
    registerModel(model, this.#dsCoreService, this.#wasmAgent)
  }

  newConversation() {
    const conversation = {
      
    } as ChatbiConverstion
    this.conversations.update((state) => [...state, conversation])
    this.conversation.set(conversation)
  }

  addHumanMessage(message: string) {
    this.conversation.update((state) => {
      return {
        ...state,
        messages: [
          ...(state.messages ?? []),
          {
            id: nanoid(),
            role: 'user',
            content: message,
            createdAt: new Date()
          }
        ]
      }
    })
  }

  addAiMessage(data: any[]) {
    this.conversation.update((state) => {
      return {
        ...state,
        messages: [
          ...(state.messages ?? []),
          {
            id: nanoid(),
            role: 'assistant',
            content: '',
            data,
            createdAt: new Date()
          }
        ]
      }
    })

    console.log(this.conversation())
  }
}
