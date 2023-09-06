import { Component, Input, Output } from 'rete';
import { numSocket } from '../sockets';
import { NumControl } from '../controls/number-control';

export class Num1Component extends Component {

  constructor() {
    super('Number');
  }

  builder(node) {
    const inp1 = new Input('num1', 'Number', numSocket);
    const out1 = new Output('num2', 'Number', numSocket);

    return node.addControl(new NumControl(this.editor, 'num'))
    .addInput(inp1).addOutput(out1);
  }

  worker(node, inputs, outputs) {
    outputs['num'] = node.data.num;
  }
}
