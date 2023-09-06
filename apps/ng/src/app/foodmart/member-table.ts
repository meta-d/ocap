import { DisplayDensity } from "@metad/ocap-angular/core";
import { DisplayBehaviour } from "@metad/ocap-core";

export const MemberTables = [
    {
      title: 'MemberTable: Store',
      type: 'MemberTable',
      dataSettings: {
        dataSource: 'FOODMART',
        entitySet: 'Sales'
      },
      dimension: {
        dimension: '[Store]',
        displayBehaviour: DisplayBehaviour.descriptionAndId
      },
      appearance: {
        displayDensity: DisplayDensity.cosy,
        color: 'accent'
      },
      options: {
        virtualScroll: true,
        initalLevel: 1,
        defaultMembers: [{ value: '[Canada]' }]
      }
    },
]