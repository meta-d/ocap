
import { MDXDialect } from './types'

describe('XmlaEntityService', () => {

  it('#Create Entity Service', () => {
    // const dataSource = new NxXmlaDataSource({
    //   type: 'XMLA',
    //   settings: {
    //     dataSourceInfo: '',
    //     catalog: ''
    //   },
    //   dialect: MDXDialect.Mondrian
    // }, new DSCacheService(), null)

    // const dsCoreService = TestBed.inject(NxDSCoreService)

    // // const service = new NxXmlaEntityService(dataSource, 'Sales')

    // expect(dsCoreService).toBeDefined()
  })

  // it('#extractDimension', () => {
  //   expect(extractDimension('[AAA].[LEVEL00]')).toEqual({
  //     dimension: '[AAA]',
  //     level: '00',
  //   })
  //   expect(extractDimension('[AAA].[LEVEL01]')).toEqual({
  //     dimension: '[AAA]',
  //     level: '01',
  //   })
  //   expect(extractDimension('[AAA].[LEVEL]')).toEqual({
  //     dimension: '[AAA]',
  //     level: 'LEVEL',
  //   })

  //   expect(extractDimension('[AAA].properties.parent_unique_name')).toEqual({
  //     dimension: '[AAA]',
  //     properties: ['PARENT_UNIQUE_NAME'],
  //   })
  // })

  // it('#uniteDimensions', () => {
  //   expect(
  //     uniteDimensions([
  //       {
  //         dimension: '[AAA]',
  //       },
  //       {
  //         dimension: '[AAA]',
  //         properties: ['PARENT_UNIQUE_NAME'],
  //       },
  //       {
  //         dimension: '[BBB]',
  //       },
  //     ])
  //   ).toEqual([
  //     {
  //       dimension: '[AAA]',
  //       properties: ['PARENT_UNIQUE_NAME'],
  //     },
  //     {
  //       dimension: '[BBB]',
  //     },
  //   ])
  // })

  // it('#redistributeDimensionAndFilters', () => {
  //   expect(
  //     redistributeDimensionAndFilters(
  //       [],
  //       [
  //         {
  //           path: '[AAA]',
  //           operator: 'EQ',
  //           value: '[123]',
  //         },
  //       ]
  //     )
  //   ).toEqual({
  //     dimensions: [],
  //     where: ['[AAA].[123]'],
  //   })
  //   expect(
  //     redistributeDimensionAndFilters(
  //       [
  //         {
  //           dimension: '[AAA]',
  //         },
  //       ],
  //       [
  //         {
  //           path: '[AAA]',
  //           operator: 'EQ',
  //           value: '[123]',
  //         },
  //       ]
  //     )
  //   ).toEqual({
  //     dimensions: [
  //       {
  //         dimension: '[AAA].[123]',
  //       },
  //     ],
  //     where: [],
  //   })
  //   expect(
  //     redistributeDimensionAndFilters(
  //       [
  //         {
  //           dimension: '[AAA]',
  //         },
  //         {
  //           dimension: '[BBB]',
  //         },
  //       ],
  //       [
  //         {
  //           path: '[AAA]',
  //           operator: 'EQ',
  //           value: ['[123]', '[234]'],
  //         },
  //       ]
  //     )
  //   ).toEqual({
  //     dimensions: [
  //       {
  //         dimension: '{[AAA].[123],[AAA].[234]}',
  //       },
  //       {
  //         dimension: '[BBB]',
  //       },
  //     ],
  //     where: [],
  //   })
  // })



  // it('#query with hierarchy level', (done) => {
  //   service = TestBed.inject(NxDSCoreService)
  //   expect(service).toBeDefined()
  //   service.getDataSource().subscribe((dataSource) => {
  //     const entityService = dataSource.createEntityService('$/CPMB/IKIJLTD')
  //     entityService.getEntityType().subscribe((entityType) => {
  //       entityService
  //         .query({
  //           selects: ['[/CPMB/IKDCQ2K                 PARENTH1]', '/CPMB/SDATA'],
  //           filters: [new NxFilter(`[/CPMB/IKDCQ2K                 PARENTH1].[LEVEL]`, 0)],
  //         })
  //         .subscribe((data) => {
  //           console.warn(data)
  //           done()
  //         })
  //     })
  //   })
  // })

  // it('#query dimension members', (done) => {
  //   service = TestBed.inject(NxDSCoreService)
  //   expect(service).toBeDefined()
  //   service.getDataSource().subscribe((dataSource) => {
  //     const entityService = dataSource.createEntityService('$/CPMB/IKIJLTD')
  //     entityService.getEntityType().subscribe((entityType) => {
  //       entityService
  //         .query({
  //           selects: ['[/CPMB/IKDBOC0                 PARENTH1]', '[/CPMB/IKDBOC0                 PARENTH1].PROPERTIES.PARENT_UNIQUE_NAME'],
  //           filters: [new NxFilter(`[/CPMB/IKDBOC0                 PARENTH1].[LEVEL]`, 1)],
  //         })
  //         .subscribe((data) => {
  //           console.warn(data)
  //           done()
  //         })
  //     })
  //   })
  // })

  // it('#query with Level and Descendants filter', (done) => {
  //   service = TestBed.inject(NxDSCoreService)
  //   expect(service).toBeDefined()
  //   service.getDataSource().subscribe((dataSource) => {
  //     const entityService = dataSource.createEntityService('$/CPMB/IKIJLTD')
  //     entityService.getEntityType().subscribe((entityType) => {
  //       entityService
  //         .query({
  //           selects: ['[/CPMB/IKDBOC0                 PARENTH1]', '/CPMB/SDATA', '[/CPMB/IKDBOC0                 PARENTH1]_Text'],
  //           filters: [
  //             new NxFilter(`[/CPMB/IKDBOC0                 PARENTH1].[LEVEL]`, 0),
  //             new NxFilter(`[/CPMB/IKDBOC0                 PARENTH1]`, [
  //               '[CAECO]',
  //               '[HC                              /CPMB/IKDBOC0]',
  //               '[ZBS1]',
  //             ]),
  //           ],
  //         })
  //         .subscribe((data) => {
  //           console.warn(data)
  //           done()
  //         })
  //     })
  //   })
  // })
})
