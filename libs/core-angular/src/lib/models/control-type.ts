export enum ControlType {
  auto = 'auto',
  /**
   * @deprecated
   */
  date = 'Date',
  /**
   * @deprecated
   */
  dateTimePicker = 'dateTimePicker',
  dropDownList = 'dropDownList',
  input = 'input',
  checkBox = 'checkBox'
}

export enum TypeAheadType {
  Local = 'Local',
  Remote = 'Remote'
}

export type TypeAhead = {
  type: TypeAheadType
  text?: string
  required?: boolean
  minimum?: number
}
