import { Injectable, InjectionToken } from '@angular/core'
import { isDate } from 'date-fns'
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from 'igniteui-angular'

export interface NxGridSelectionSummary {
  operate(data: any[]): IgxSummaryResult[]
}

@Injectable()
export class NxGridSelectionSummaryService implements NxGridSelectionSummary {
  operate(data: any[]): IgxSummaryResult[] {
    const result = new IgxSummaryOperand().operate(data)
    if (data.length < 1) {
      return result
    }
    const numberData = data.filter((rec) => typeof rec === 'number')
    const boolData = data.filter((rec) => typeof rec === 'boolean')
    const dates = data.filter((rec) => isDate(rec))
    if (numberData.length) {
      result.push({ key: 'min', label: 'Min', summaryResult: IgxNumberSummaryOperand.min(numberData) })
      result.push({ key: 'max', label: 'Max', summaryResult: IgxNumberSummaryOperand.max(numberData) })
      result.push({ key: 'avg', label: 'Avg', summaryResult: IgxNumberSummaryOperand.average(numberData) })
      result.push({ key: 'sum', label: 'Sum', summaryResult: IgxNumberSummaryOperand.sum(numberData) })
    }
    if (boolData.length) {
      result.push({
        key: 'test',
        label: 'Discounted',
        summaryResult: boolData.filter((rec) => rec).length + ' of ' + boolData.length,
      })
    }
    if (dates.length) {
      result.push({ key: 'earliest', label: 'Earliest', summaryResult: IgxDateSummaryOperand.earliest(dates) })
      result.push({ key: 'latest', label: 'Latest', summaryResult: IgxDateSummaryOperand.latest(dates) })
    }
    return result
  }
}

export const NX_GRID_SELECTION_SUMMARY = new InjectionToken<NxGridSelectionSummary>('nx-grid-selection-summary', {
  providedIn: 'root',
  factory: NX_GRID_SELECTION_SUMMARY_FACTORY,
})

/** @docs-private */
export function NX_GRID_SELECTION_SUMMARY_FACTORY(): NxGridSelectionSummary {
  return new NxGridSelectionSummaryService()
}
