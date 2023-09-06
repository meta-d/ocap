import { convertMDXProperty } from './metadata'
import { DIMENSION_TYPE } from './rowset'

describe('Metadata', () => {
  it('#convertMDXProperty', () => {
    expect(
      convertMDXProperty({
        CATALOG_NAME: 'xxxxxxxxxx',
        CUBE_NAME: 'xxxxxxxxxx',
        DEFAULT_HIERARCHY: 'xxxxxxxxxx',
        DESCRIPTION: 'xxxxxxxxxx',
        DIMENSION_CAPTION: 'xxxxxxxxxx',
        DIMENSION_CARDINALITY: 123456,
        DIMENSION_GUID: 'xxxxxxxxxx',
        DIMENSION_IS_VISIBLE: true,
        DIMENSION_NAME: 'xxxxxxxxxx',
        DIMENSION_ORDINAL: 123456,
        DIMENSION_TYPE: DIMENSION_TYPE.MD_DIMTYPE_CUSTOMERS,
        DIMENSION_UNIQUE_NAME: 'xxxxxxxxxx',
        SCHEMA_NAME: 'xxxxxxxxxx'
      })
    ).toEqual({
      catalogName: 'xxxxxxxxxx',
      cubeName: 'xxxxxxxxxx',
      defaultHierarchy: 'xxxxxxxxxx',
      description: 'xxxxxxxxxx',
      dimensionCaption: 'xxxxxxxxxx',
      dimensionCardinality: 123456,
      dimensionGuid: 'xxxxxxxxxx',
      dimensionIsVisible: true,
      dimensionName: 'xxxxxxxxxx',
      dimensionOrdinal: 123456,
      dimensionType: 7,
      dimensionUniqueName: 'xxxxxxxxxx',
      schemaName: 'xxxxxxxxxx'
    })
  })
})
