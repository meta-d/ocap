import {
    Component,
    Input,
    HostBinding,
    ChangeDetectorRef,
    OnChanges
  } from "@angular/core";
  import { ClassicPreset } from "rete";
  import { CommonModule, KeyValue } from "@angular/common";
import { ReteModule } from "rete-angular-plugin/17";
  
  @Component({
    standalone: true,
    imports: [
        CommonModule,
        ReteModule
    ],
    templateUrl: "./node.component.html",
    styleUrls: ["./node.component.scss"],
    host: {
      "data-testid": "node"
    }
  })
  export class DimensionNodeComponent implements OnChanges {
    @Input() data!: ClassicPreset.Node;
    @Input() emit!: (data: any) => void;
    @Input() rendered!: () => void;
  
    seed = 0;
  
    @HostBinding("class.selected") get selected() {
      return this.data.selected;
    }
  
    constructor(private cdr: ChangeDetectorRef) {
      this.cdr.detach();
    }
  
    ngOnChanges(): void {
      this.cdr.detectChanges();
      requestAnimationFrame(() => this.rendered());
      this.seed++; // force render sockets
    }
  
    sortByIndex<
      N extends object,
      T extends KeyValue<string, N & { index?: number }>
    >(a: T, b: T) {
      const ai = a.value.index || 0;
      const bi = b.value.index || 0;
  
      return ai - bi;
    }
  }
  