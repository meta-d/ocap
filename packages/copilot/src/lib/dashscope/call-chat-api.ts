import { parseComplexResponse } from '../shared/parse-complex-response';
import {
  ChatRequest,
  FunctionCall,
  IdGenerator,
  JSONValue,
  Message,
  ToolCall,
} from 'ai';
import { COMPLEX_HEADER, createChunkDecoder } from 'ai';
import { DashScopeStream } from '../streams';

export async function callChatApi({
  api,
  model,
  chatRequest,
  messages,
  body,
  credentials,
  headers,
  abortController,
  appendMessage,
  restoreMessagesOnFailure,
  onResponse,
  onUpdate,
  onFinish,
  generateId,
}: {
  api: string;
  chatRequest: ChatRequest;
  model: string;
  messages: Omit<Message, 'id'>[];
  body: Record<string, any>;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  abortController?: () => AbortController | null;
  restoreMessagesOnFailure: () => void;
  appendMessage: (message: Message) => void;
  onResponse?: (response: Response) => void | Promise<void>;
  onUpdate: (merged: Message[], data: JSONValue[] | undefined) => void;
  onFinish?: (message: Message) => void;
  generateId: IdGenerator;
}): Promise<Message | { messages: Message[]; data: JSONValue[] }> {
  const { functions, function_call } = chatRequest

  const response = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({
      input: {
        result_format: 'message',
        messages,
        functions,
        function_call,
      },
      parameters: {
      },
      model
    }),
    headers: {
      ...headers,
      'content-type': 'application/json',
      accept: 'text/event-stream'
    },
    signal: abortController?.()?.signal,
    credentials,
  }).catch(err => {
    restoreMessagesOnFailure();
    throw err;
  });

  if (onResponse) {
    try {
      await onResponse(response);
    } catch (err) {
      throw err;
    }
  }

  if (!response.ok) {
    restoreMessagesOnFailure();
    throw new Error(
      (await response.text()) || 'Failed to fetch the chat response.',
    );
  }

  if (!response.body) {
    throw new Error('The response body is empty.');
  }

  const reader = DashScopeStream(response).getReader();
  const isComplexMode = response.headers.get(COMPLEX_HEADER) === 'true';

  if (isComplexMode) {
    return await parseComplexResponse({
      reader,
      abortControllerRef:
        abortController != null ? { current: abortController() } : undefined,
      update: onUpdate,
      onFinish(prefixMap) {
        if (onFinish && prefixMap.text != null) {
          onFinish(prefixMap.text);
        }
      },
      generateId,
    });
  } else {
    const createdAt = new Date();
    const decode = createChunkDecoder(false);

    // TODO-STREAMDATA: Remove this once Stream Data is not experimental
    let streamedResponse = '';
    const replyId = generateId();
    const responseMessage: Message = {
      id: replyId,
      createdAt,
      content: '',
      role: 'assistant',
    };

    // TODO-STREAMDATA: Remove this once Stream Data is not experimental
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Update the chat state with the new message tokens.
      streamedResponse = decode(value);

      console.log(streamedResponse)

      if (streamedResponse.startsWith('{"function_call":')) {
        // While the function call is streaming, it will be a string.
        responseMessage['function_call'] = streamedResponse;
      } else if (streamedResponse.startsWith('{"tool_calls":')) {
        // While the tool calls are streaming, it will be a string.
        responseMessage['tool_calls'] = streamedResponse;
      } else {
        responseMessage['content'] = streamedResponse;
      }

      appendMessage({ ...responseMessage });

      // The request has been aborted, stop reading the stream.
      if (abortController?.() === null) {
        reader.cancel();
        break;
      }
    }

    if (streamedResponse.startsWith('{"function_call":')) {
      // Once the stream is complete, the function call is parsed into an object.
      const parsedFunctionCall: FunctionCall =
        JSON.parse(streamedResponse).function_call;

      responseMessage['function_call'] = parsedFunctionCall;

      appendMessage({ ...responseMessage });
    }
    if (streamedResponse.startsWith('{"tool_calls":')) {
      // Once the stream is complete, the tool calls are parsed into an array.
      const parsedToolCalls: ToolCall[] =
        JSON.parse(streamedResponse).tool_calls;

      responseMessage['tool_calls'] = parsedToolCalls;

      appendMessage({ ...responseMessage });
    }

    if (onFinish) {
      onFinish(responseMessage);
    }

    return responseMessage;
  }
}
