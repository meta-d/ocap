import { from, mergeMap, Observable } from 'rxjs'
import * as XLSX from 'xlsx'

export interface UploadSheetType {
  name: string
  tableName: string
  columns: Array<{
    name: string
    fieldName: string
    type: 'Numeric' | 'String' | 'Date'
  }>
  data: Array<unknown>
  //   preview: Array<unknown>
  status: 'done' | 'uploading' | 'error'
  info: string
}

/**
 * 加载 Excel 文件并转换成 JSON 格式的数据
 */
export function fetchExcelFile(name: string, sourceUrl: string, delimiter?: string): Observable<any> {
  // Load from excel
  return from(
    fetch(sourceUrl).then((response) => {
      if (response.ok) {
        return response
      }
      throw new Error(`Can't download file '${sourceUrl}' for reason: ${response.statusText || response.status}`)
    })
  ).pipe(
    mergeMap(
      (response) =>
        new Observable((subscriber) => {
          const contentLength = Number(response.headers.get('Content-Length'))
          const reader = response.body.getReader()

          ;(async () => {
            let receivedLength = 0 // received that many bytes at the moment
            let chunks = [] // array of received binary chunks (comprises the body)
            while (true) {
              const { done, value } = await reader.read()

              if (done) {
                break
              }

              chunks.push(value)
              receivedLength += value.length

              subscriber.next({
                type: 'DownloadProgress',
                payload: receivedLength / contentLength
              })
            }
            let blob = new Blob(chunks)
            const wb = XLSX.read(await blob.arrayBuffer(), { type: 'array', FS: delimiter })

            try {
              const data = await readExcelJson(wb, name)
              subscriber.next({
                type: 'Response',
                payload: data
              })
            } catch(err) {
              subscriber.error(err)
            }
            
          })().then(() => subscriber.complete())
        })
    )
  )
}

export async function readExcelJson(wSheet, fileName = ''): Promise<UploadSheetType[]> {
  const XLSX = await import('xlsx')

  // AOA : array of array
  type AOA = any[][]
  return wSheet.SheetNames.map((name) => {
    const origExcelData = <AOA>XLSX.utils.sheet_to_json(wSheet.Sheets[name], {
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
        type: mapToTableColumnType(item ? typeof item[column] : 'string')
      }
    })

    return {
      sheetName: wSheet.SheetNames.length > 1 ? name : fileName,
      name: wSheet.SheetNames.length > 1 ? name : fileName,
      columns: columns.filter((col) => !!col),
      data: excelDataEncodeToJson,
      sdata: JSON.stringify(excelDataEncodeToJson)
    }
  })
}

addEventListener('message', ({ data }) => {
  try {
    fetchExcelFile(data.name, data.url, data.delimiter).subscribe({
      next: (value) => {
        postMessage(value)
      },
      error: (error) => {
        postMessage({
          type: 'Error',
          error: error.message
        })
      },
      complete: () => {}
    })
  } catch (error: any) {
    postMessage({
      type: 'Error',
      error: error.message
    })
  }
})

export function mapToTableColumnType(type: string): string {
  switch(type) {
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