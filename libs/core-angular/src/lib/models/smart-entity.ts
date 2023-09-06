import { EntityBusinessState, PresentationVariant, SelectionVariant } from "@metad/ocap-core";

export interface SmartEntityDataOptions<T> extends EntityBusinessState {
    selectionVariant?: SelectionVariant
    presentationVariant?: PresentationVariant
}
