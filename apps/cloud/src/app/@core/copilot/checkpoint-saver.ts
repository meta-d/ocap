import { Injectable, Provider } from '@angular/core'
import { RunnableConfig } from '@langchain/core/runnables'
import { Checkpoint, CheckpointMetadata, CheckpointTuple } from '@langchain/langgraph/dist/checkpoint/base'
import { BaseCheckpointSaver, MemorySaver } from '@langchain/langgraph/web'

@Injectable({
  providedIn: 'root'
})
export class CopilotCheckpointSaver extends MemorySaver { // extends BaseCheckpointSaver {
  constructor() {
    super()
  }

  // async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
  //   console.log(`get tuple:`, config.configurable)
  //   return null
  // }

  // async *list(config: RunnableConfig, limit?: number, before?: RunnableConfig): AsyncGenerator<CheckpointTuple> {
  //   console.log(`list checkpoints:`, config, limit, before)
  // }

  // async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
  //   console.log(`put checkpoint:`, config, checkpoint, metadata)
  //   return null
  // }
}

export function provideCheckpointSaver(): Provider[] {
  return [
    {
      provide: BaseCheckpointSaver,
      useExisting: CopilotCheckpointSaver
    }
  ]
}
