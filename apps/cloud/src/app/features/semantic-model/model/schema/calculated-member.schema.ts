import { Injectable } from '@angular/core'
import { CalculatedMemberAttributesSchema } from './calculated-member-attributes.schema'

@Injectable()
export class CalculatedMemberSchemaService extends CalculatedMemberAttributesSchema {

  get calculatedSettings() {
    const COMMON = this.SCHEMA?.COMMON
    const CALCULATED_MEMBER = this.SCHEMA?.CALCULATED_MEMBER
    const calculatedSettings = super.calculatedSettings as any

    // calculatedSettings[0].fieldGroup.push({
    //   key: 'calculatedProperties',
    //   type: 'array',
    //   props: {
    //     label: COMMON?.Property ?? 'Property'
    //   },
    //   fieldArray: {
    //     fieldGroupClassName: FORMLY_ROW,
    //     fieldGroup: [
    //       {
    //         key: 'name',
    //         type: 'input',
    //         className: 'nx-formly__col nx-formly__col-4',
    //         props: {
    //           label: COMMON?.Name ?? 'Name'
    //         }
    //       },
    //       {
    //         key: 'value',
    //         type: 'input',
    //         className: 'nx-formly__col nx-formly__col-8',
    //         props: {
    //           label: COMMON?.Value ?? 'Value'
    //         }
    //       }
    //     ]
    //   }
    // })
    return calculatedSettings
  }
}
