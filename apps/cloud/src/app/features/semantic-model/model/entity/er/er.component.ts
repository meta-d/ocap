import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild, viewChildren } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import ELK from 'elkjs'
import { map, withLatestFrom } from 'rxjs/operators'
import { SemanticModelService } from '../../model.service'
import { ModelEntityService } from '../entity.service'

@Component({
  standalone: true,
  imports: [CommonModule, DragDropModule, NgmEntityPropertyComponent],
  selector: 'pac-model-er',
  templateUrl: './er.component.html',
  styleUrls: ['./er.component.scss'],
  host: {
    class: 'pac-model-er'
  }
})
export class ERComponent {
  readonly cubeService = inject(ModelEntityService)
  readonly modelService = inject(SemanticModelService)
  readonly destroyRef = inject(DestroyRef)

  readonly container = viewChild('container', { read: ElementRef })
  readonly dimensionElements = viewChildren('dimensionRef', { read: ElementRef })
  readonly cubeElement = viewChild('cubeRef', { read: ElementRef })

  readonly dimensions = this.cubeService.cubeDimensions$

  readonly dimensionUsages = toSignal(
    this.cubeService.dimensionUsages$.pipe(
      withLatestFrom(this.modelService.sharedDimensions$),
      map(([dimensionUsages, sharedDimensions]) => {
        const dimensions = []
        for (const usage of dimensionUsages) {
          const dimension = sharedDimensions.find((d) => d.name === usage.source)
          if (dimension) {
            dimensions.push({ ...dimension, name: usage.name, __id__: usage.__id__ })
          }
        }
        return dimensions
      })
    )
  )

  readonly cube = this.cubeService.cube

  readonly edges = signal<Record<string, any>>({})

  readonly connections = computed(() => {
    const cube = this.cube()
    const connections = []
    for (const dimension of this.dimensionUsages()) {
        connections.push({
            id: dimension.__id__,
            sources: [ cube.__id__ ],
            targets: [ dimension.__id__ ]
        })
    }
    return connections
  })

  readonly layout = signal<Record<string, any>>({})

  elk = new ELK()

  constructor() {
    const graph = {
      id: 'root',
      layoutOptions: { 'elk.algorithm': 'layered' },
      children: [
        { id: 'n1', width: 30, height: 30 },
        { id: 'n2', width: 30, height: 30 },
        { id: 'n3', width: 30, height: 30 }
      ],
      edges: [
        { id: 'e1', sources: ['n1'], targets: ['n2'] },
        { id: 'e2', sources: ['n1'], targets: ['n3'] }
      ]
    }

    afterNextRender(() => {
        this.arrage()
    })
  }

  arrage() {
    const dimensions = this.dimensionElements()
    const graph = {
        id: 'root',
        layoutOptions: { 'elk.algorithm': 'radial' },
        children: [
            ...dimensions.map((dimension) => {
                return {
                    // Set [data-key] attribute to the dimension element
                    id: dimension.nativeElement.getAttribute('data-key'),
                    width: dimension.nativeElement.offsetWidth,
                    height: dimension.nativeElement.offsetHeight
                }
            }),
            // Cube
            {
                id: this.cube().__id__,
                width: this.cubeElement().nativeElement.offsetWidth,
                height: this.cubeElement().nativeElement.offsetHeight
            }
        ],
        edges: this.connections()
      }

      console.log(`graph:`, graph)

      this.elk.layout(graph).then((graph) => {
        console.log(`graph result:`, graph)
        this.container().nativeElement.style.width = graph.width + 'px';
        this.container().nativeElement.style.height = graph.height + 'px';

        // 遍历节点，设置节点的位置和大小
        this.layout.set(graph.children.reduce((acc, node) => {
            acc[node.id] = node;
            return acc
            }, {}))
        this.edges.set(graph.edges.reduce((acc, edge) => {
            const section = edge.sections[0]
            acc[edge.id] = `M${section.startPoint.x},${section.startPoint.y} Q${section.endPoint.x},${section.endPoint.y} ${section.endPoint.x},${section.endPoint.y}`
            return acc
        }, {}))
    }).catch(console.error)
  }

  recalculateEdges() {
    
  }
}
