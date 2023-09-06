import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Input } from 'rete';
import { NodeComponent, NodeService } from '../render-plugin/index';
import { numSocket } from '../sockets';

@Component({
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  providers: [NodeService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyNodeComponent extends NodeComponent {

  io = new Input('', 'Number', numSocket)
  
  constructor(protected service: NodeService, protected cdr: ChangeDetectorRef) {
    super(service, cdr);


  }
}
