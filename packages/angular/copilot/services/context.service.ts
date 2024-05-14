import { DestroyRef, Injectable, InjectionToken, computed, inject, signal } from '@angular/core'
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai'
import {
  AnnotatedFunction,
  CopilotCommand,
  CopilotContext,
  CopilotContextParam,
  entryPointsToChatCompletionFunctions,
  entryPointsToFunctionCallHandler
} from '@metad/copilot'
import { ISelectOption } from '@metad/ocap-angular/core'
import { AgentExecutor } from 'langchain/agents'
import { Observable, firstValueFrom, map } from 'rxjs'

export const NgmCopilotContextToken = new InjectionToken<NgmCopilotContextService>('NgmCopilotContextToken')

@Injectable()
export class NgmCopilotContextService implements CopilotContext {
  readonly destroyRef = inject(DestroyRef)
  readonly parentContext? = inject(NgmCopilotContextToken, { optional: true, skipSelf: true })

  readonly children = signal(new Set<NgmCopilotContextService>())

  // Commands
  readonly #commands = signal<
    Record<
      string,
      CopilotCommand & {
        llm?: ChatOpenAI<ChatOpenAICallOptions>
        agentExecutor?: AgentExecutor
      }
    >
  >({})

  readonly commands = computed(() => {
    const children = this.children()
    const commands = [...Object.values(this.#commands())]
    for (const child of children) {
      commands.push(...child.commands())
    }
    return commands
  })

  // Entry Points
  readonly #entryPoints = signal<Record<string, AnnotatedFunction<any[]>>>({})

  readonly getFunctionCallHandler = computed(() => {
    return entryPointsToFunctionCallHandler(Object.values(this.#entryPoints()))
  })
  readonly getChatCompletionFunctionDescriptions = computed(() => {
    return entryPointsToChatCompletionFunctions(Object.values(this.#entryPoints()))
  })
  readonly getGlobalFunctionDescriptions = computed(() => {
    const ids = Object.keys(this.#entryPoints()).filter(
      (id) => !Object.values(this.#commands()).some((command) => command.actions?.includes(id))
    )
    return entryPointsToChatCompletionFunctions(ids.map((id) => this.#entryPoints()[id]))
  })

  // contexts
  readonly cubes = signal<Observable<ISelectOption<{
    dataSource: string;
    serizalize: () => Promise<string>
  }>[]>>(null)
  readonly items = computed(() =>
    this.cubes().pipe(
      map((cubes) =>
        cubes.map((cube) => ({
          key: cube.key,
          caption: cube.caption,
          uKey: cube.key.split(' ').join('_'),
          serizalize: cube.value.serizalize,
          value: {
            ...cube.value,
          }
        }))
      )
    )
  )

  constructor() {
    this.parentContext?.registerChild(this)

    this.destroyRef.onDestroy(() => {
      console.log('destroyed')
      this.parentContext?.unregisterChild(this)
    })
  }

  registerChild(child: NgmCopilotContextService) {
    console.log('child registered')
    this.children.update((children) => new Set(children.add(child)))
  }

  unregisterChild(child: NgmCopilotContextService) {
    console.log('child unregistered')
    this.children.update((children) => {
      const newChildren = new Set(children)
      newChildren.delete(child)
      return newChildren
    })
  }

  async registerCommand(name: string, command: CopilotCommand | Promise<CopilotCommand>) {
    let _command: CopilotCommand = null
    if (command instanceof Promise) {
      _command = await command
    } else {
      _command = command
    }
    this.#commands.update((state) => ({
      ...state,
      [name]: {
        ..._command,
        name
      }
    }))
  }

  unregisterCommand(name: string) {
    this.#commands.update((state) => {
      delete state[name]
      return {
        ...state
      }
    })
  }

  setEntryPoint(id: string, entryPoint: AnnotatedFunction<any[]>) {
    this.#entryPoints.update((state) => ({
      ...state,
      [id]: entryPoint
    }))
  }

  removeEntryPoint(id: string) {
    this.#entryPoints.update((prevPoints) => {
      const newPoints = { ...prevPoints }
      delete newPoints[id]
      return newPoints
    })
  }

  getEntryPoint(id: string) {
    return this.#entryPoints()[id]
  }

  /**
   * Find command by name or alias
   *
   * @param name Name or alias of command
   * @returns AI Command
   */
  getCommand(name: string) {
    const { command } = this.getCommandWithContext(name) ?? {}
    return command
  }

  getCommandWithContext(name: string): { command: CopilotCommand; context: CopilotContext } | null {
    const command = this.#commands()[name] ?? Object.values(this.#commands()).find((command) => command.alias === name)
    if (command) {
      return { command, context: this }
    }

    const children = this.children()
    for (const child of children) {
      const { command, context } = child.getCommandWithContext(name) ?? {}
      if (command) {
        return { command, context }
      }
    }

    return null
  }

  async getContextItem(uKey: string) {
    const items = await firstValueFrom(this.items())
    return items.find((item) => item.uKey === uKey)
  }
}

// 识别 prompt 中的 context 提示
export async function recognizeContext(prompt: string, context: CopilotContext) {
  const params = await recognizeContextParams(prompt, context)

  let contextContent = ''
  for(const param of params) {
    contextContent += await param.item.serizalize()
  }
  return contextContent
}

export async function recognizeContextParams(prompt: string, context: CopilotContext) {
  const params: CopilotContextParam[] = []
  const words = prompt.split(' ')
  for (const word of words) {
    if (context && word.startsWith('@')) {
      params.push({
        content: word.slice(1),
        context,
        item: await context.getContextItem(word.slice(1))
      })
    }
  }

  return params
}