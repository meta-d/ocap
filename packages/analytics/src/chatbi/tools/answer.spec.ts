import { createSlicersTitle } from './answer'

describe('Answer', () => {
	beforeEach(async () => {
		//
	})

	describe('createSlicersTitle', () => {
		it('should return an array', async () => {
			const result = createSlicersTitle([
				{
					dimension: {
						dimension: '[0RTYPE]',
						hierarchy: '[0RTYPE]',
						parameter: '[!V000003]'
					},
					members: [
						{
							key: '[M]',
							caption: '在平均比率下的标准兑换'
						}
					]
				},
				{
					dimension: {
						dimension: '[0CURRENCY]',
						hierarchy: '[0CURRENCY]',
						parameter: '[!V000004]'
					},
					members: [
						{
							key: '[USD]',
							caption: 'USD'
						}
					]
				},
				{
					dimension: {
						dimension: '[2CP3MJ5KTNH8ZFZHFAZCH2WTDYK]',
						hierarchy: '[2CP3MJ5KTNH8ZFZHFAZCH2WTDYK]'
					},
					members: [
						{
							key: '2024',
							value: '2024'
						}
					]
				}
			])

			console.log(result)

			expect(result).toStrictEqual([])
		})

		it('should return an array', async () => {
			const result = createSlicersTitle([
				{
					dimension: {
						dimension: '[0RTYPE]',
						hierarchy: '[0RTYPE]',
						parameter: '[!V000003]'
					},
					members: [
						{
							key: '[M]',
							caption: '在平均比率下的标准兑换'
						}
					]
				},
				{
					dimension: {
						dimension: '[0CURRENCY]',
						hierarchy: '[0CURRENCY]',
						parameter: '[!V000004]'
					},
					members: [
						{
							key: '[USD]',
							caption: 'USD'
						}
					]
				},
				{
					dimension: {
						parameter: '',
						dimension: '[2CISDDISTRCHANNEL]',
						hierarchy: '[2CISDDISTRCHANNEL]',
						level: '[2CISDDISTRCHANNEL].[LEVEL01]',
						zeroSuppression: true
					},
					exclude: false,
					members: [
						{
							key: '[00]',
							caption: '通用'
						}
					]
				},
				{
					dimension: {
						dimension: '[2CP3MJ5KTNH8ZFZHFAZCH2WTDYK]',
						hierarchy: '[2CP3MJ5KTNH8ZFZHFAZCH2WTDYK]'
					},
					members: [
						{
							key: '2024',
							value: '2024'
						}
					]
				}
			])

			console.log(result)

			expect(result).toStrictEqual([])
		})
	})
})
