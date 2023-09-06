import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core'
import { isEmpty } from 'lodash-es'
import { Engine, NodeEditor } from 'rete'
import ConnectionPlugin from 'rete-connection-plugin'
import { withLatestFrom } from 'rxjs'
import { uuid } from '../../../@core'
import { AutoArrangePlugin } from './auto-arrange-plugin'
import { AddComponent } from './components/add-component'
import { CubeComponent } from './components/cube-component'
import { DimensionComponent } from './components/dimension-component'
import { HierarchyComponent } from './components/hierarchy-component'
import { TableComponent } from './components/table-component'
import { AngularRenderPlugin } from './render-plugin/index'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-erm',
  templateUrl: './er-model.component.html',
  host: { class: 'pac-model-erm' },
  styles: [
    `
      :host {
        flex: 1;
      }
      .wrapper {
        width: 100% !important;
        height: 100% !important;
      }

      .socket.number {
        background: #96b38a;
      }
    `
  ]
})
export class ERModelComponent {
  @ViewChild('nodeEditor', { static: true }) el: ElementRef
  
  private editor = null

  // public readonly cube$ = this.entityService.rtEntityCube$

  constructor(
    // public modelService: PACModelService,
    // public entityService: PACModelEntityService
    ) {}

  async ngAfterViewInit() {
    const container = this.el.nativeElement

    const cubeComponent = new CubeComponent()
    const dimensionComponent = new DimensionComponent()
    const tableComponent = new TableComponent()
    const components = [new AddComponent(), cubeComponent, dimensionComponent, tableComponent]

    const editor = new NodeEditor('demo@0.2.0', container)
    editor.use(ConnectionPlugin)
    editor.use(AngularRenderPlugin)
    editor.use(AutoArrangePlugin, { margin: { x: 50, y: 50 }, offset: {x: 10, y: 300}, depth: 100 })

    const engine = new Engine('demo@0.2.0')

    components.map((c) => {
      editor.register(c)
      engine.register(c)
    })

    editor.clear()
    const cubeNode = await cubeComponent.createNode({ title: 'A', cube: {name: 'A'} })
    editor.addNode(cubeNode)
    const dNode = await dimensionComponent.createNode({ title: 'B', dimension: {name: 'B'} })
    editor.addNode(dNode)

    const tNode = await tableComponent.createNode({title: 'C', entityType: {name: 'C', properties: {
      A: {
        __id__: uuid(),
        name: 'A',
        label: '字段 A'
      },
      B: {
        __id__: uuid(),
        name: 'B',
        label: '字段 B'
      }
    } }})
    editor.addNode(tNode)
    editor.view.resize()
    editor.trigger('arrange' as any, { node: tNode })
    editor.silent = true

    // editor.connect(cubeNode.outputs.get(usage.__id__), dNode.inputs.get(dimension.__id__))

    // this.cube$.pipe(withLatestFrom(this.modelService.dimensions$)).subscribe(async ([cube, dimensionUsages]) => {
    //   console.warn(cube)

    //   editor.clear()

    //   const cubeNode = await cubeComponent.createNode({ title: cube.label || cube.name, cube })
    //   editor.addNode(cubeNode)

    //   if (!isEmpty(cube.DimensionUsage)) {
    //     for (let i = 0; i < cube.DimensionUsage.length; i++) {
    //       const usage = cube.DimensionUsage[i]
    //       const dimension = dimensionUsages.find(item => item.name === usage.source)
    //       const dNode = await dimensionComponent.createNode({ title: dimension.label || dimension.name, dimension })
    //       editor.addNode(dNode)
    //       editor.connect(cubeNode.outputs.get(usage.__id__), dNode.inputs.get(dimension.__id__))

    //       for (let j = 0; j < dimension.Hierarchy?.length; j++) {
    //         const hierarchy = dimension.Hierarchy[j]
    //         const hNode = await hierarchyComponent.createNode({ title: hierarchy.label || hierarchy.name || dimension.name, hierarchy })
    //         editor.addNode(hNode)
    //         editor.connect(dNode.outputs.get(hierarchy.__id__), hNode.inputs.get(hierarchy.__id__))
    //       }
    //     }
    //   }
    //   if (!isEmpty(cube.Dimension)) {
    //     for (let i = 0; i < cube.Dimension.length; i++) {
    //       const dimension = cube.Dimension[i]
    //       const dNode = await dimensionComponent.createNode({ title: dimension.label || dimension.name, dimension })
    //       editor.addNode(dNode)

    //       editor.connect(cubeNode.outputs.get(dimension.__id__), dNode.inputs.get(dimension.__id__))

    //       for (let j = 0; j < dimension.Hierarchy?.length; j++) {
    //         const hierarchy = dimension.Hierarchy[j]
    //         const hNode = await hierarchyComponent.createNode({ title: hierarchy.label || hierarchy.name || dimension.name, hierarchy })
    //         editor.addNode(hNode)
    //         editor.connect(dNode.outputs.get(hierarchy.__id__), hNode.inputs.get(hierarchy.__id__))
    //       }
    //     }
    //   }

    //   editor.view.resize()
    //   editor.trigger('arrange' as any, { node: cubeNode })
    //   editor.silent = true
    // })

    editor.on(['process', 'nodecreated', 'noderemoved', 'connectioncreated', 'connectionremoved'], (async (event) => {

      console.log(event)
      
      await engine.abort()
      await engine.process(editor.toJSON())

      console.log(editor.toJSON())
    }) as any)

    // editor.view.resize()
    // editor.trigger('process')
    // editor.silent = true
  }

}
