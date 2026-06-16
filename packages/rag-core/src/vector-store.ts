import {
  DocumentChunk,
  MedicalDocumentType,
  RetrievedChunk,
} from "@medilex/types";
import { Pool } from "pg";

const TABLE_NAME = "document_chunks";

export const ensureTable = async (pool: Pool): Promise<void> => {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    content       TEXT NOT NULL,
    metadata      JSONB NOT NULL DEFAULT '{}',
    embedding     vector(1536) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${TABLE_NAME}_embedding
        ON ${TABLE_NAME} USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
    `);
};

export const upsertChunks = async (
  pool: Pool,
  chunks: DocumentChunk[],
  embeddings: number[][],
): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      const embedding = embeddings[i]!;
      await client.query(
        `INSERT INTO ${TABLE_NAME} (id, document_id, content, metadata, embedding)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             content   = EXCLUDED.content,
             metadata  = EXCLUDED.metadata,
             embedding = EXCLUDED.embedding`,
        [
          chunk.id,
          chunk.documentId,
          chunk.content,
          JSON.stringify(chunk.metadata),
          JSON.stringify(embedding),
        ],
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const searchSimilar = async (
  pool: Pool,
  embedding: number[],
  topK: number,
  filterTypes?: MedicalDocumentType[],
): Promise<RetrievedChunk[]> => {
  let query = `
      SELECT id, document_id, content, metadata,
             1 - (embedding <=> $1::vector) AS score
      FROM ${TABLE_NAME}
    `;
  const params: unknown[] = [JSON.stringify(embedding)];

  if (filterTypes && filterTypes.length > 0) {
    params.push(filterTypes);
    query += ` WHERE metadata->>'type' = ANY($${params.length})`;
  }

  query += ` ORDER BY embedding <=> $1::vector LIMIT $${params.length + 1}`;
  params.push(topK);

  const result = await pool.query(query, params);

  return result.rows.map((row: Record<string, unknown>) => ({
    chunk: {
      id: row.id as string,
      documentId: row.document_id as string,
      content: row.content as string,
      metadata: row.metadata as DocumentChunk["metadata"],
    },
    score: Number(row.score),
  }));
};
