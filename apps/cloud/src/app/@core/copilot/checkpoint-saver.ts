import { HttpClient } from '@angular/common/http'
import { inject, Injectable, Provider } from '@angular/core'
import { RunnableConfig } from '@langchain/core/runnables'
import { Checkpoint, CheckpointMetadata, CheckpointTuple } from '@langchain/langgraph/dist/checkpoint/base'
import { BaseCheckpointSaver } from '@langchain/langgraph/web'
import { ICopilotCheckpoint } from '@metad/contracts'
import { firstValueFrom, map } from 'rxjs'
import { API_COPILOT_CHECKPOINT } from '../constants/app.constants'

@Injectable({
  providedIn: 'root'
})
export class CopilotCheckpointSaver extends BaseCheckpointSaver {
  readonly #httpClient = inject(HttpClient)

  constructor() {
    super()
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const { thread_id, checkpoint_id } = config.configurable || {}
    const row = await firstValueFrom(
      this.#httpClient
        .get<{ items: ICopilotCheckpoint[] }>(API_COPILOT_CHECKPOINT, {
          params: {
            $filter: JSON.stringify({
              thread_id,
              checkpoint_id
            }),
            $order: JSON.stringify({
              checkpoint_id: 'DESC'
            })
          }
        })
        .pipe(map((res) => res.items[0]))
    )

    if (row) {
      return {
        config: {
          configurable: {
            thread_id: row.thread_id,
            checkpoint_id: row.checkpoint_id
          }
        },
        checkpoint: (await this.serde.parse(row.checkpoint)) as Checkpoint,
        metadata: (await this.serde.parse(row.metadata)) as CheckpointMetadata,
        parentConfig: row.parent_id
          ? {
              configurable: {
                thread_id: row.thread_id,
                checkpoint_id: row.parent_id
              }
            }
          : undefined
      }
    }
    return undefined
  }

  async *list(config: RunnableConfig, limit?: number, before?: RunnableConfig): AsyncGenerator<CheckpointTuple> {
    console.log(`list checkpoints:`, config, limit, before)
  }

  async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
    await firstValueFrom(
      this.#httpClient.post(API_COPILOT_CHECKPOINT, {
        thread_id: config.configurable?.thread_id,
        checkpoint_id: checkpoint.id,
        parent_id: config.configurable?.checkpoint_id,
        checkpoint: this.serde.stringify(checkpoint),
        metadata: this.serde.stringify(metadata)
      })
    )

    return {
      configurable: {
        thread_id: config.configurable?.thread_id,
        checkpoint_id: checkpoint.id
      }
    }
  }
}

export function provideCheckpointSaver(): Provider[] {
  return [
    {
      provide: BaseCheckpointSaver,
      useExisting: CopilotCheckpointSaver
    }
  ]
}
