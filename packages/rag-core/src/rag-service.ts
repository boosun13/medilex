import { ChatAnthropic } from "@langchain/anthropic";
import { OpenAIEmbeddings } from "@langchain/openai";
import {
  Citation,
  IngestDocumentResponseDto,
  MedicalDocument,
  RagQueryInput,
  RagQueryResult,
  RetrievedChunk,
} from "@medilex/types";
import { Pool } from "pg";
import { splitDocument } from "./splitter";
import { embedQuery, embedTexts } from "./embeddings";
import { searchSimilar, upsertChunks } from "./vector-store";
import { generateAnswer } from "./llm";

const DEFAULT_TOP_K = 5;

export interface RagServiceDeps {
  pool: Pool;
  embeddings: OpenAIEmbeddings;
  llm: ChatAnthropic;
}

const toCitations = (retrieved: RetrievedChunk[]): Citation[] => {
  return retrieved.map(({ chunk, score }) => ({
    documentId: chunk.documentId,
    chunkId: chunk.id,
    title: chunk.metadata.title,
    type: chunk.metadata.type,
    url: chunk.metadata.url,
    score,
  }));
};

export const createRagService = (deps: RagServiceDeps) => {
  const { pool, embeddings, llm } = deps;

  const ingest = async (
    doc: MedicalDocument,
  ): Promise<IngestDocumentResponseDto> => {
    const chunks = await splitDocument(doc);
    const vectors = await embedTexts(
      chunks.map((c) => c.content),
      embeddings,
    );
    await upsertChunks(pool, chunks, vectors);
    return {
      documentId: doc.id,
      chunkCount: chunks.length,
    };
  };

  const query = async (input: RagQueryInput): Promise<RagQueryResult> => {
    const vector = await embedQuery(input.question, embeddings);
    const retrieved = await searchSimilar(
      pool,
      vector,
      input.topK ?? DEFAULT_TOP_K,
      input.filterTypes,
    );
    const answer = await generateAnswer(input.question, retrieved, llm);
    return { answer, citations: toCitations(retrieved) };
  };

  return { ingest, query };
};
