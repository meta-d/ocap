import { PropertyHierarchy } from '@metad/ocap-core'
import { Component, Input, Node, Output } from 'rete'
import { MyNodeComponent } from '../node/node.component'
import { AngularComponent, AngularComponentData } from '../render-plugin/index'
import { dimensionSocket } from '../sockets'

export class HierarchyComponent extends Component implements AngularComponent {
  data: AngularComponentData

  constructor() {
    super('Hierarchy')
    this.data.render = 'angular'
    this.data.component = MyNodeComponent
  }

  async builder(node: Node) {
    console.warn(node.data)

    const hierarchy = node.data.hierarchy as PropertyHierarchy

    node.addInput(new Input(hierarchy.__id__, node.data.title as string, dimensionSocket))

    hierarchy.levels?.forEach((level) => {
      const input = new Input(level.__id__, level.label || level.name, dimensionSocket)
      const out = new Output(level.__id__, 'Number', dimensionSocket)

      node.addInput(input).addOutput(out)
    })

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
