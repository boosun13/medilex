import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DocumentChunk, MedicalDocument } from "@medilex/types";

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

export const splitDocument = async (
  doc: MedicalDocument,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
  },
): Promise<DocumentChunk[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options?.chunkSize ?? DEFAULT_CHUNK_SIZE,
    chunkOverlap: options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
  });

  const texts = await splitter.splitText(doc.content);

  return texts.map((text, index) => ({
    id: `${doc.id}-chunk-${index}`,
    documentId: doc.id,
    content: text,
    metadata: {
      ...doc.metadata,
      chunkIndex: index,
    },
  }));
};
