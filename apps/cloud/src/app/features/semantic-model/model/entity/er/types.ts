import { ClassicPreset, GetSchemes, NodeEditor } from 'rete'
export class EntityNode extends ClassicPreset.Node {
    constructor(label: string, public type?: 'dimension' | 'cube', public value?: any) {
        super(label)
    }
}