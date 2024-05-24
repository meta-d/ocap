import { VectorStoreInterface, VectorStoreRetrieverInterface, VectorStoreRetrieverMMRSearchKwargs, VectorStoreRetrieverInput } from '@langchain/core/vectorstores'
import { BaseRetriever } from '@langchain/core/retrievers';
import { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager';
import { DocumentInterface } from '@langchain/core/documents';
import { CopilotExampleService } from '../services/';
import { Signal } from '@angular/core';

/**
 * Type for options when adding a document to the VectorStore.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AddDocumentOptions = Record<string, any>;

/**
 * Class for performing document retrieval from a VectorStore. Can perform
 * similarity search or maximal marginal relevance search.
 */
export class VectorStoreRetriever<
    V extends VectorStoreInterface = VectorStoreInterface
  >
  extends BaseRetriever
  implements VectorStoreRetrieverInterface
{
  static lc_name() {
    return "VectorStoreRetriever";
  }

  get lc_namespace() {
    return ["langchain_core", "vectorstores"];
  }

  vectorStore: V;

  k = 4;

  searchType = "similarity";

  searchKwargs?: VectorStoreRetrieverMMRSearchKwargs;

  filter?: V["FilterType"];

  command: string;
  role: Signal<string>;
  _vectorstoreType(): string {
    return this.vectorStore._vectorstoreType();
  }

  constructor(fields: VectorStoreRetrieverInput<V> & {command: string; role: Signal<string>}, private readonly service: CopilotExampleService) {
    super(fields);
    this.vectorStore = fields.vectorStore;
    this.k = fields.k ?? this.k;
    this.searchType = fields.searchType ?? this.searchType;
    this.filter = fields.filter;
    if (fields.searchType === "mmr") {
      this.searchKwargs = fields.searchKwargs;
    }
    this.command = fields.command;
    this.role = fields.role;
  }

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<DocumentInterface[]> {
    if (this.searchType === "mmr") {
      if (typeof this.service.maxMarginalRelevanceSearch !== "function") {
        throw new Error(
          `The vector store backing this retriever, ${this._vectorstoreType()} does not support max marginal relevance search.`
        );
      }
      return this.service.maxMarginalRelevanceSearch(
        query,
        {
          k: this.k,
          filter: this.filter,
          command: this.command,
          role: this.role(),
          ...this.searchKwargs,
        },
      );
    }

    return this.service.similaritySearch(
      query,
      {
        command: this.command,
        k: this.k,
        filter: this.filter,
        role: this.role(),
      }
    )
  }

  async addDocuments(
    documents: DocumentInterface[],
    options?: AddDocumentOptions
  ): Promise<string[] | void> {
    return this.vectorStore.addDocuments(documents, options);
  }
}