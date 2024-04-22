import { ChangeDetectorRef, DestroyRef, Injector } from '@angular/core'
import { ClassicPreset, GetSchemes, NodeEditor } from 'rete'
import { AngularArea2D, AngularPlugin, Presets } from 'rete-angular-plugin/17'
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin'
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin'
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
  ArrangeAppliers
} from "rete-auto-arrange-plugin"
import { DimensionNodeComponent } from './dimension-node/node.component'
import { EntityNode } from './types'
import { ModelEntityService } from '../entity.service'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { nonNullable } from '@metad/core'
import { filter, withLatestFrom } from 'rxjs/operators'
import { SemanticModelService } from '../../model.service'
import { CubeNodeComponent } from './cube-node/node.component'
import { PropertyDimension } from '@metad/ocap-core'

type Schemes = GetSchemes<EntityNode, ClassicPreset.Connection<EntityNode, EntityNode>>
type AreaExtra = AngularArea2D<Schemes>

export async function createEditor(container: HTMLElement, injector: Injector) {
  const socket = new ClassicPreset.Socket('socket')

  const editor = new NodeEditor<Schemes>()
  const area = new AreaPlugin<Schemes, AreaExtra>(container)
  const connection = new ConnectionPlugin<Schemes, AreaExtra>()
  const render = new AngularPlugin<Schemes, AreaExtra>({ injector })
  const arrange = new AutoArrangePlugin<any>();
  const cubeService = injector.get(ModelEntityService)
  const modelService = injector.get(SemanticModelService)
  const destroyRef = injector.get(DestroyRef)
  const _cdr = injector.get(ChangeDetectorRef)

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  })
 
  render.addPreset(
    Presets.classic.setup({
      customize: {
        node(context) {
          console.log(context)
          return context.payload.type === 'dimension' ? DimensionNodeComponent : CubeNodeComponent;
        },
      }
    })
  )
  render.addPreset(Presets.classic.setup())

  connection.addPreset(ConnectionPresets.classic.setup())
  const applier = new ArrangeAppliers.TransitionApplier<any, never>({
    duration: 500,
    timingFunction: (t) => t,
    async onTick() {
      await AreaExtensions.zoomAt(area, editor.getNodes());
    }
  });

  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area)
  area.use(connection)
  area.use(render)
  area.use(arrange)

  AreaExtensions.simpleNodesOrder(area)

  // const a = new EntityNode('Customer', 'dimension')
  // a.addControl('a', new ClassicPreset.InputControl('text', { initial: 'hello' }))
  // a.addOutput('a', new ClassicPreset.Output(socket, 'Key'))
  // await editor.addNode(a)

  // const b = new EntityNode('Sales', 'cube')
  // b.addControl('b', new ClassicPreset.InputControl('text', { initial: 'hello' }))
  // b.addInput('b', new ClassicPreset.Input(socket, 'Customer Key'))
  // await editor.addNode(b)

  // await area.translate(b.id, { x: 320, y: 0 })

  

  // await arrange.layout({  })
  AreaExtensions.zoomAt(area, editor.getNodes())

  async function layout(animate: boolean) {
    await arrange.layout({ applier: animate ? applier : undefined });
    AreaExtensions.zoomAt(area, editor.getNodes());
  }

  // Innser dimensions
  cubeService.cube$.pipe(filter(nonNullable), withLatestFrom(modelService.sharedDimensions$), takeUntilDestroyed(destroyRef)).subscribe(async ([cube, dimensions]) => {
    const nodes = editor.getNodes()
    let cubeNode = nodes.find((n) => n.value?.__id__ === cube.__id__)
    if (!cubeNode) {
      cubeNode = new EntityNode(cube.caption || cube.name, 'cube', cube)
      await editor.addNode(cubeNode)
    }

    for (const dimensionUsage of cube.dimensionUsages) {
      const dimension = dimensions.find((d) => d.name === dimensionUsage.name)
      if (dimension) {
        await upsertDimensionNode(cubeNode, dimension, editor, socket)
      }
    }

    for (const dimension of cube.dimensions) {
      await upsertDimensionNode(cubeNode, dimension, editor, socket)
    }

    // await layout(true)
    _cdr.detectChanges()
  })

  // // Dimension usages
  // cubeService.dimensionUsages$.pipe(
  //   filter(nonNullable),
  //   withLatestFrom(modelService.sharedDimensions$),
  //   takeUntilDestroyed(destroyRef)
  // ).subscribe(([dimensionUsages, sharedDimensions]) => {
  //   dimensionUsages?.filter((d) => d.name).forEach((dimension) => {
  //   })
  // })

  editor.addPipe(context => {
    console.log(context)
    return context
  })

  return {
    layout,
    destroy: () => area.destroy()
  };
}


async function upsertDimensionNode(cubeNode: EntityNode, dimension: PropertyDimension, editor: NodeEditor<Schemes>, socket) {
  if (dimension.name) {
    if (!cubeNode.hasInput(dimension.name)) {
      cubeNode.addInput(dimension.name, new ClassicPreset.Input(socket, dimension.name))
    } else {
      cubeNode.inputs[dimension.name].label = dimension.caption || dimension.name
    }

    let node = editor.getNodes().find((n) => n.value?.__id__ === dimension.__id__)
    if (!node) {
      node = new EntityNode(dimension.caption || dimension.name, 'dimension', dimension)
      node.addOutput(dimension.name, new ClassicPreset.Output(socket, dimension.caption || dimension.name))
      await editor.addNode(node)
      await editor.addConnection(new ClassicPreset.Connection(node, dimension.name, cubeNode, dimension.name))
    }

    dimension.hierarchies?.forEach((hierarchy) => {
      if (hierarchy.name) {
        node.addOutput(hierarchy.__id__, new ClassicPreset.Output(socket, hierarchy.caption || hierarchy.name))
      } else {
        hierarchy.levels?.forEach((level) => {
          node.addOutput(level.__id__, new ClassicPreset.Output(socket, level.caption || level.name))
        })
      }
    })
  }
}