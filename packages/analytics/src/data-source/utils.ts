import { CreationTable, DBQueryRunner, createQueryRunnerByType, File } from '@metad/adapter'
import { AuthenticationEnum } from '@metad/contracts'
import { UploadSheetType, getErrorMessage, readExcelWorkSheets } from '@metad/server-common'
import { RequestContext } from '@metad/server-core'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { DataSource } from './data-source.entity'

export async function prepareDataSource(dataSource: DataSource) {
	const userId = RequestContext.currentUserId()
	// Basic authentication for single user
	if (dataSource.authType === AuthenticationEnum.BASIC) {
		const authentication = dataSource.authentications?.find((item) => item.userId === userId)
		if (!authentication) {
			throw new NotFoundException(`未找到当前用户认证信息`)
		}

		dataSource.options.username = authentication.username
		dataSource.options.password = authentication.password
	}
	return dataSource
}

export async function dataLoad(dataSource: DataSource, sheets: CreationTable[], file: File) {
	const runner = createQueryRunnerByType(dataSource.type.type, dataSource.options)
	
	if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
		try {
			return await loadFromExcel(runner, sheets, file)
		} catch (error) {
			throw new BadRequestException(error.message)
		}
	}

	let data = null
	if (file.mimetype === 'text/csv') {
		const _sheets: UploadSheetType[] = await readExcelWorkSheets(file.originalname, file)
		data = _sheets[0].data
	}

	const config = sheets[0]
	try {
		return await runner.import(
			{
				...config,
				file,
				data
			},
			{
				catalog: config.catalog
			}
		)
	} catch (error) {
		throw new BadRequestException(getErrorMessage(error))
	}
}

export async function loadFromExcel(runner: DBQueryRunner, sheets: CreationTable[], file: File) {
	const _sheets: UploadSheetType[] = await readExcelWorkSheets(file.originalname, file)
	// 并发导入
	await Promise.all(
		_sheets.map((_sheet, index) => {
			const sheet = sheets[index]
			const dataStr = JSON.stringify(_sheet.data)
			const dataBuffer = Buffer.from(dataStr)

			return runner.import(
				{
					name: sheet.name,
					columns: sheet.columns,
					file: {
						buffer: dataBuffer
					} as File,
					format: 'json',
					mergeType: sheet.mergeType
				},
				{
					catalog: sheet.catalog
				}
			)
		})
	)
}
