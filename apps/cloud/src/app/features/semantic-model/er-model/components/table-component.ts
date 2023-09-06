import { EntityType } from '@metad/ocap-core'
import { Component, Input, Node, Output } from 'rete'
import { MyNodeComponent } from '../node/node.component'
import { AngularComponent, AngularComponentData } from '../render-plugin/index'
import { dimensionSocket } from '../sockets'

export class TableComponent extends Component implements AngularComponent {
  data: AngularComponentData

  constructor() {
    super('Table')
    this.data.render = 'angular'
    this.data.component = MyNodeComponent
  }

  async builder(node: Node) {
    console.warn(node.data)

    const entityType = node.data.entityType as EntityType

    node.addInput(new Input(entityType.name, entityType.name, dimensionSocket))

    if (entityType?.properties) {
      Object.values(entityType.properties).forEach((dimension) => {
        const input = new Input(dimension.__id__, dimension.label || dimension.name, dimensionSocket)
        const out = new Output(dimension.__id__, 'Number', dimensionSocket)
  
        node.addInput(input).addOutput(out)
      })
    }
  }

  worker(node, inputs, outputs) {
    // const n1 = inputs['num1'].length ? inputs['num1'][0] : node.data.num1;
    // const n2 = inputs['num2'].length ? inputs['num2'][0] : node.data.num2;
    // const sum = n1 + n2;
    // const ctrl = <NumControl> this.editor.nodes.find(n => n.id === node.id).controls.get('preview');
    // ctrl.setValue(sum);
    // outputs['num'] = sum;
  }

  created(node) {
    console.log('created', node)
  }

  destroyed(node) {
    console.log('destroyed', node)
  }
}
