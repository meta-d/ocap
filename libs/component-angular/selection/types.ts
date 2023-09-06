import { InjectionToken } from '@angular/core'


/** Default `nx-selection` options that can be overridden. */
export interface NxSelectionDefaultOptions {
  /** Whether the first option should be highlighted when an autocomplete panel is opened. */
  maxTagCount?: number
  paging?: boolean
  tableOptions?: any
}

/** Injection token to be used to override the default options for `nx-selection`. */
export const NX_SELECTION_DEFAULT_OPTIONS = new InjectionToken<NxSelectionDefaultOptions>(
  'nx-selection-default-options',
  {
    providedIn: 'root',
    factory: NX_SELECTION_DEFAULT_OPTIONS_FACTORY,
  }
)

/** @docs-private */
export function NX_SELECTION_DEFAULT_OPTIONS_FACTORY(): NxSelectionDefaultOptions {
  return { maxTagCount: 5, paging: false, tableOptions: {paging: true} }
}

export enum SlicersCapacity {
  CombinationSlicer = 'CombinationSlicer',
  AdvancedSlicer = 'AdvancedSlicer'
}
