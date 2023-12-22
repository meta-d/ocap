import { signal } from '@angular/core';
import type {
  ChatRequest,
  ChatRequestOptions,
  CreateMessage,
  IdGenerator,
  JSONValue,
  Message,
  UseChatOptions,
  experimental_StreamingReactResponse,
} from 'ai';
import { nanoid } from 'ai'

export type { CreateMessage, Message, UseChatOptions };

export type UseChatHelpers = {
  /** Current messages in the chat */
  messages: Message[];
  /** The error object of the API request */
  error: undefined | Error;
  /**
   * Append a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   * @param message The message to append
   * @param options Additional options to pass to the API call
   */
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  /**
   * Reload the last AI chat response for the given chat history. If the last
   * message isn't from the assistant, it will request the API to generate a
   * new response.
   */
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop: () => void;
  /**
   * Update the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: (messages: Message[]) => void;
  /** The current value of the input */
  input: string;
  /** setState-powered method to update the input value */
  setInput: string;
  /** An input/textarea-ready onChange handler to control the value of the input */
  handleInputChange: (
    e: any,
  ) => void;
  /** Form submission handler to automatically reset input and append a user message */
  handleSubmit: (
    e: any,
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  metadata?: Object;
  /** Whether the API request is in progress */
  isLoading: boolean;
  /** Additional data added on the server via StreamData */
  data?: JSONValue[] | undefined;
};

type StreamingReactResponseAction = (payload: {
  messages: Message[];
  data?: Record<string, string>;
}) => Promise<experimental_StreamingReactResponse>;

export function injectChat({
  api = '/api/chat',
  id,
  initialMessages,
  initialInput = '',
  sendExtraMessageFields,
  experimental_onFunctionCall,
  onResponse,
  onFinish,
  onError,
  credentials,
  headers,
  body,
  generateId = nanoid,
}: Omit<UseChatOptions, 'api'> & {
  api?: string | StreamingReactResponseAction;
  key?: string;
} = {}): UseChatHelpers {
  // Generate a unique id for the chat if not provided.
  const hookId = generateId();
  const idKey = id ?? hookId;
  const chatKey = typeof api === 'string' ? [api, idKey] : idKey;

  // Store a empty array as the initial messages
  // (instead of using a default parameter value that gets re-created each time)
  // to avoid re-renders:
  const initialMessagesFallback = signal([])

  console.log(`initialMessagesFallback:`, initialMessagesFallback())
  return {
    messages: [],
    error: null,
    append: null,
    reload: null,
    stop: null,
    setMessages: null,
    input: null,
    setInput: null,
    handleInputChange: null,
    handleSubmit: null,
    isLoading: null,
    data: null,
  };
}