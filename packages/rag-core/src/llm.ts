import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { RetrievedChunk } from "@medilex/types";

const DEFAULT_MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `あなたは医療文書の専門アシスタントです。
  提供されたコンテキスト（医療文書の抜粋）に基づいて質問に回答してください。

  ルール:
  - コンテキストに含まれる情報のみを使って回答すること
  - 情報が不十分な場合は、その旨を明示すること
  - 出典となるドキュメントのタイトルを回答に含めること
  - 医療上の判断は必ず医師に相談するよう注記すること`;

export const createLlm = (options?: { apiKey?: string; model?: string }) => {
  return new ChatAnthropic({
    anthropicApiKey: options?.apiKey,
    model: options?.model ?? DEFAULT_MODEL,
  });
};

const buildContext = (chunks: RetrievedChunk[]): string => {
    return chunks
    .map(
      (c, i) => `[出典${i + 1}: ${c.chunk.metadata.title}]\n${c.chunk.content}`,
    )
    .join("\n\n---\n\n");
};

export const generateAnswer = async (
  question: string,
  chunks: RetrievedChunk[],
  llm: ChatAnthropic,
): Promise<string> => {
  const context = buildContext(chunks);
  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`コンテキスト:\n${context}\n\n質問: ${question}`),
  ]);

  return response.content as string;
};
