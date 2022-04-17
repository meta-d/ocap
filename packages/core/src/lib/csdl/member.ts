export enum MemberType {
  MDMEMBER_TYPE_REGULAR = 1,
  MDMEMBER_TYPE_ALL     = 2,
  MDMEMBER_TYPE_FORMULA = 3, 
  MDMEMBER_TYPE_MEASURE = 4,
  MDMEMBER_TYPE_UNKNOWN = 5
}

export interface IDimensionMember {
  modelId: string
  entity: string
  dimension: string
  hierarchy: string
  level: string
  levelNumber: number
  memberOrdinal: number
  memberName: string
  memberUniqueName: string
  memberType: MemberType
  memberGuid?: string
  memberCaption: string
  memberIsVisible?: boolean
  childrenCardinality: number
  parentLevel: number
  parentUniqueName?: string
  parentCount: number
  treeOp?: string
  depth?: number
}
