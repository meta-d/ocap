import { CommonModule, KeyValue } from '@angular/common'
import { ChangeDetectorRef, Component, HostBinding, Input, OnChanges, effect, input, signal } from '@angular/core'
import { ClassicPreset } from 'rete'
import { ReteModule } from 'rete-angular-plugin/17'
import { EntityNode } from '../types'

@Component({
  standalone: true,
  imports: [CommonModule, ReteModule],
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  host: {
    'data-testid': 'node'
  }
})
export class DimensionNodeComponent implements OnChanges {
  get data() {
    return this.dataSignal()
  }
  set data(value) {
    this.dataSignal.set(value)
  }
  readonly dataSignal = signal<EntityNode>({} as EntityNode)

  @Input() emit!: (data: any) => void
  @Input() rendered!: () => void

  seed = 0

  @HostBinding('class.selected') get selected() {
    return this.dataSignal().selected
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.cdr.detach()

    effect(() => {
      requestAnimationFrame(() => this.rendered())
      this.seed++

      console.log(`node data`, this.dataSignal())
    })
  }

  ngOnChanges(): void {
    this.cdr.detectChanges()
    // this.seed++; // force render sockets
  }

  sortByIndex<N extends object, T extends KeyValue<string, N & { index?: number }>>(a: T, b: T) {
    const ai = a.value.index || 0
    const bi = b.value.index || 0

    return ai - bi
  }
}
