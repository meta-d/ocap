/**
 * @todo 添加完整属性
 */
export interface ContactType {
  // Full name
  fn: string
  n: NameType
  // ...
}

export interface NameType {
  // Surname or family name
  surname: string
  // Given name
  given: string
  // Additional names
  additional: string
  // Honorific prefix(es)
  prefix: string
  // 	Honorific suffix(es)
  suffix: string
}
