import { Signal, TemplateRef } from "@angular/core"
import { Property } from "@metad/ocap-core"

export interface TableColumn extends Property {
    width?: string
    cellTemplate?: TemplateRef<any> | Signal<TemplateRef<any>>,
    pipe?: (value: any) => any
    searching?: boolean
    sticky?: boolean
    stickyEnd?: boolean
}