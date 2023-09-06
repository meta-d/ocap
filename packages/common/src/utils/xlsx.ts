import * as XLSX from 'xlsx'

export declare type TableColumnType = 'String' | 'Integer' | 'Numeric' | 'Boolean' | 'Datetime' | 'Date'
export interface UploadSheetType {
  file: File
  fileName: string
  name: string
  columns: Array<{
    isKey?: boolean
    name: string
    fieldName: string
    type: TableColumnType
  }>
  data: Array<unknown>
  preview: Array<unknown>
  status: 'done' | 'uploading' | 'error'
  info: string
}

export async function readExcelWorkSheets(fileName: string, file: any /*Express.Multer.File*/) {
  const workBook: XLSX.WorkBook = file.buffer ?
    XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
    }) : XLSX.readFile(file.path, {
      type: 'file',
      cellDates: true,
      cellNF: false,
    })

  return await readExcelJson(workBook, fileName)
}

export async function readExcelJson(wSheet, fileName = ''): Promise<UploadSheetType[]> {
  const name = fileName
    .replace(/\.xlsx$/, '')
    .replace(/\.xls$/, '')
    .replace(/\.csv$/, '')

  // AOA : array of array
  type AOA = any[][]

  // const sheetCellRange = XLSX.utils.decode_range(wSheet['!ref'])
  // const sheetMaxRow = sheetCellRange.e.r

  return wSheet.SheetNames.map((sheetName) => {
    const origExcelData = <AOA>XLSX.utils.sheet_to_json(wSheet.Sheets[sheetName], {
      header: 1,
      range: wSheet['!ref'],
      raw: true
    })

    const refExcelData = origExcelData.slice(1).map((value) => Object.assign([], value))
    const excelTransformNum = origExcelData[0].map((col) => `${col}`.trim())

    /* 合併成JSON */
    const excelDataEncodeToJson = refExcelData.slice(0).map((item, row) =>
      item.reduce((obj, val, i) => {
        if (!excelTransformNum[i]) {
          throw new Error(`没有找到 ${row + 2} 行 ${i + 1} 列单元格对应的列名称`)
        }
        obj[excelTransformNum[i].trim()] = val
        return obj
      }, {})
    )

    const columns = excelTransformNum.map((column, i) => {
      const item = excelDataEncodeToJson.find((item) => typeof item[column] !== 'undefined')
      return {
        name: column,
        fieldName: column,
        type: mapToTableColumnType(item ? typeof item[column] : null)
      }
    })

    return {
      fileName,
      name: wSheet.SheetNames.length > 1 ? sheetName : name,
      columns: columns.filter((col) => !!col),
      data: excelDataEncodeToJson,
    //   preview: excelDataEncodeToJson.slice(0, 50)
    }
  })
}

export function mapToTableColumnType(type: string): TableColumnType {
  switch (type) {
    case 'string':
      return 'String'
    case 'number':
      return 'Numeric'
    case 'date':
      return 'Date'
    default:
      return 'String'
  }
}
