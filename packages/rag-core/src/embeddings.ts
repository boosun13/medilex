import { OpenAIEmbeddings } from "@langchain/openai";

const DEFAULT_MODEL = "text-embedding-3-small";

export const createEmbeddings = (options?: {
  apiKey?: string;
  model?: string;
}) => {
  return new OpenAIEmbeddings({
    openAIApiKey: options?.apiKey,
    model: options?.model ?? DEFAULT_MODEL,
  });
};

export const embedTexts = async (
    texts: string[],
    embeddings: OpenAIEmbeddings,
): Promise<number[][]> => {
    return embeddings.embedDocuments(texts);
}

export const embedQuery = async (
    text: string,
    embeddings: OpenAIEmbeddings,
): Promise<number[]> => {
    return embeddings.embedQuery(text);
}
